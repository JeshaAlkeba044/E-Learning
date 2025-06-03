"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaterialProgress = exports.getCourseProgress = exports.getDashboardLearner = exports.updateMaterialProgress = exports.getUserProgress = void 0;
const models_1 = require("../models");
const UserMaterialProgress_1 = require("../models/UserMaterialProgress");
const Transaction_1 = require("../models/Transaction");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const sequelize_1 = require("sequelize");
exports.getUserProgress = [
    authMiddleware_1.authenticate,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            // Ambil transaksi sukses
            const transactions = yield Transaction_1.Transaction.findAll({
                where: { id_user: user.id_user, status: 'completed' },
                include: [
                    {
                        model: models_1.Course,
                        include: [
                            {
                                model: models_1.User,
                                as: 'instructor_Id',
                                attributes: ['role', 'firstName', 'lastName'],
                            },
                        ],
                    },
                ],
            });
            // Kumpulkan progress untuk tiap kursus
            const progress = yield Promise.all(transactions.map((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                const course = transaction.course;
                if (!course || !course.instructor_Id)
                    return null;
                // Cek role instruktur
                const decryptedRole = (0, cryptoUtil_1.decrypt)(course.instructor_Id.role);
                if (decryptedRole !== 'tutor')
                    return null;
                // Ambil semua materi
                const materials = yield models_1.Material.findAll({
                    where: { id_course: course.id_course },
                    attributes: ['id_material'],
                });
                const totalMaterials = materials.length;
                const completedMaterials = yield UserMaterialProgress_1.UserMaterialProgress.count({
                    where: {
                        id_user: user.id_user,
                        is_completed: true,
                        id_material: materials.map((m) => m.id_material),
                    },
                });
                // Ambil lastAccessed dari UserMaterialProgress
                const lastMaterialIds = materials.map((m) => m.id_material);
                const lastProgress = yield UserMaterialProgress_1.UserMaterialProgress.findOne({
                    where: {
                        id_user: user.id_user,
                        id_material: { [sequelize_1.Op.in]: lastMaterialIds },
                    },
                    order: [['last_accessed', 'DESC']],
                });
                const decryptedFirstname = (0, cryptoUtil_1.decrypt)(course.instructor_Id.firstName);
                const decryptedLastname = (0, cryptoUtil_1.decrypt)(course.instructor_Id.lastName);
                return {
                    courseId: course.id_course,
                    courseTitle: course.title,
                    courseCategory: course.category,
                    thumbnail: course.thumbnail_path || '../../assets/img/course-placeholder.jpg',
                    instructor: `${decryptedFirstname} ${decryptedLastname}`,
                    progress: totalMaterials > 0
                        ? Math.round((completedMaterials / totalMaterials) * 100)
                        : 0,
                    module_done: completedMaterials,
                    total_module: totalMaterials,
                    lastAccessed: lastProgress === null || lastProgress === void 0 ? void 0 : lastProgress.last_accessed,
                    totalHours: Math.round(course.total_duration / 60) || 0,
                };
            })));
            // Filter null (jika ada yang gagal karena bukan tutor)
            const filteredProgress = progress.filter((p) => p !== null);
            console.log('\n\n\n\nUser progress:', filteredProgress);
            res.status(200).json({ success: true, data: filteredProgress });
        }
        catch (error) {
            console.error('Error in getUserProgress:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil progress user' });
        }
    }),
];
// Update the updateMaterialProgress function
const updateMaterialProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { materialId } = req.params;
        const { isCompleted } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Find or create progress record
        const [progress, created] = yield UserMaterialProgress_1.UserMaterialProgress.findOrCreate({
            where: { id_user: userId, id_material: materialId },
            defaults: {
                is_completed: isCompleted,
                last_accessed: new Date()
            }
        });
        if (!created) {
            progress.is_completed = isCompleted;
            progress.last_accessed = new Date();
            yield progress.save();
        }
        // Update course total progress
        const material = yield models_1.Material.findByPk(materialId);
        if (material) {
            const courseId = material.id_course;
            yield updateCourseProgress(userId, courseId);
        }
        res.json(progress);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateMaterialProgress = updateMaterialProgress;
function updateCourseProgress(userId, courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Calculate new progress for the course
        const totalMaterials = yield models_1.Material.count({
            where: { id_course: courseId }
        });
        const completedMaterials = yield UserMaterialProgress_1.UserMaterialProgress.count({
            where: {
                id_user: userId,
                is_completed: true,
                id_material: {
                    [sequelize_1.Op.in]: models_1.sequelize.literal(`(SELECT id_material FROM materials WHERE id_course = '${courseId}')`)
                }
            }
        });
        return {
            totalMaterials,
            completedMaterials,
            progress: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0
        };
    });
}
exports.getDashboardLearner = [
    authMiddleware_1.authenticate,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user.id_user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const transactions = yield Transaction_1.Transaction.findAll({
                where: {
                    id_user: user.id_user,
                    status: "completed",
                },
                include: [
                    {
                        model: models_1.Course,
                        as: "course",
                    },
                ],
            });
            const activeTransactions = transactions.filter((trx) => {
                const course = trx.course;
                return course === null || course === void 0 ? void 0 : course.is_active;
            });
            const activeCourses = activeTransactions.length;
            const studyHours = activeTransactions.reduce((total, trx) => {
                const course = trx.course;
                return total + ((course === null || course === void 0 ? void 0 : course.total_duration) || 0);
            }, 0);
            const totalModuleCompleted = yield UserMaterialProgress_1.UserMaterialProgress.count({
                where: {
                    id_user: user.id_user,
                    is_completed: true,
                },
            });
            res.json({
                activeCourses,
                studyHours: Math.floor(studyHours / 60),
                moduleCompleted: totalModuleCompleted,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", detail: error.message });
        }
    }),
];
const getCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Hitung total material dalam course
        const totalMaterials = yield models_1.Material.count({
            where: { id_course: id }
        });
        // Hitung material yang sudah diselesaikan
        const completedMaterials = yield UserMaterialProgress_1.UserMaterialProgress.count({
            where: {
                id_user: userId,
                is_completed: true,
                id_material: {
                    [sequelize_1.Op.in]: models_1.sequelize.literal(`(SELECT id_material FROM materials WHERE id_course = '${id}')`)
                }
            }
        });
        // Hitung progress dalam persentase
        const progress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;
        res.json({
            totalMaterials,
            completedMaterials,
            progress
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCourseProgress = getCourseProgress;
const getMaterialProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { materialId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const progress = yield UserMaterialProgress_1.UserMaterialProgress.findOne({
            where: {
                id_user: userId,
                id_material: materialId
            }
        });
        res.json({
            is_completed: (progress === null || progress === void 0 ? void 0 : progress.is_completed) || false
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMaterialProgress = getMaterialProgress;
