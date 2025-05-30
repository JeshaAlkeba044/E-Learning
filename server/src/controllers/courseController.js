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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCoursesByInstructor = exports.createCourse = exports.getMaterialById = exports.getCourseMaterials = exports.getCourseById = exports.getRecommendationCourses = exports.getAllCourses = void 0;
const models_1 = require("../models");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const sequelize_2 = require("sequelize");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Transaction_1 = require("../models/Transaction");
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, level, sort, search } = req.query;
        const where = {};
        const order = [['created_at', 'DESC']];
        if (category && category !== 'all') {
            where.category = category;
        }
        if (level && level !== 'all') {
            where.level = level;
        }
        if (search) {
            where.title = { [sequelize_1.Op.like]: `%${search}%` };
        }
        if (sort) {
            switch (sort) {
                case 'newest':
                    order[0] = ['created_at', 'DESC'];
                    break;
                case 'highest-rated':
                    order[0] = ['rating', 'DESC'];
                    break;
                case 'price-low':
                    order[0] = ['price', 'ASC'];
                    break;
                case 'price-high':
                    order[0] = ['price', 'DESC'];
                    break;
                default:
                    order[0] = ['enrollment_count', 'DESC'];
            }
        }
        const courses = yield models_1.Course.findAll({
            where,
            order,
            include: [
                {
                    model: models_1.User,
                    as: 'instructor_Id',
                    attributes: ['firstName', 'lastName', 'photo_path']
                }
            ]
        });
        const courseIds = courses.map(course => course.id_course);
        const materialCounts = yield models_1.Material.findAll({
            attributes: ['id_course', [(0, sequelize_2.fn)('COUNT', (0, sequelize_2.col)('id_material')), 'material_count']],
            where: {
                id_course: {
                    [sequelize_1.Op.in]: courseIds
                }
            },
            group: ['id_course']
        });
        const materialCountMap = {};
        materialCounts.forEach((item) => {
            materialCountMap[item.id_course] = parseInt(item.getDataValue('material_count'));
        });
        const coursesWithCounts = courses.map(course => {
            const material_count = materialCountMap[course.id_course] || 0;
            const courseData = course.toJSON();
            // Cek dan decrypt nama instructor
            if (courseData.instructor_Id) {
                courseData.instructor_Id.firstName = (0, cryptoUtil_1.decrypt)(courseData.instructor_Id.firstName);
                courseData.instructor_Id.lastName = (0, cryptoUtil_1.decrypt)(courseData.instructor_Id.lastName);
            }
            return Object.assign(Object.assign({}, courseData), { material_count });
        });
        res.json(coursesWithCounts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllCourses = getAllCourses;
exports.getRecommendationCourses = [authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            console.log("\n\n\n\n\nUser ID:", user.id_user);
            const { limit } = req.query;
            if (!user.id_user) {
                res.status(400).json({ message: 'userId diperlukan' });
                return;
            }
            const where = {};
            const order = [['created_at', 'DESC']];
            const parsedLimit = limit ? parseInt(limit) : undefined;
            // 🔥 Ambil semua transaksi si user, jadi tahu course yang udah dimiliki
            const userTransactions = yield Transaction_1.Transaction.findAll({
                where: { id_user: user.id_user },
                attributes: ['id_course'],
            });
            const ownedCourseIds = userTransactions.map((trx) => trx.id_course);
            // 🔥 Ambil course yang belum dimiliki user
            const courses = yield models_1.Course.findAll({
                where: Object.assign(Object.assign({}, where), { id_course: { [sequelize_1.Op.notIn]: ownedCourseIds }, is_active: true // Optional: hanya course yang aktif
                 }),
                order,
                limit: parsedLimit,
                include: [
                    {
                        model: models_1.User,
                        as: 'instructor_Id',
                        attributes: ['firstName', 'lastName', 'photo_path']
                    }
                ]
            });
            const courseIds = courses.map(course => course.id_course);
            const materialCounts = yield models_1.Material.findAll({
                attributes: ['id_course', [(0, sequelize_2.fn)('COUNT', (0, sequelize_2.col)('id_material')), 'material_count']],
                where: { id_course: { [sequelize_1.Op.in]: courseIds } },
                group: ['id_course']
            });
            const materialMap = {};
            materialCounts.forEach((item) => {
                materialMap[item.id_course] = parseInt(item.getDataValue('material_count'));
            });
            const recommendations = courses.map(course => {
                var _a, _b;
                const courseData = course.toJSON();
                const total_module = materialMap[course.id_course] || 0;
                const instructorFirstName = (0, cryptoUtil_1.decrypt)(((_a = courseData.instructor_Id) === null || _a === void 0 ? void 0 : _a.firstName) || '');
                const instructorLastName = (0, cryptoUtil_1.decrypt)(((_b = courseData.instructor_Id) === null || _b === void 0 ? void 0 : _b.lastName) || '');
                return {
                    courseId: courseData.id_course,
                    title: courseData.title,
                    category: courseData.category,
                    thumbnail: courseData.thumbnail_path,
                    instructor: `${instructorFirstName} ${instructorLastName}`,
                    total_module,
                    totalHours: Math.round(courseData.total_duration / 60),
                    price: courseData.price,
                };
            });
            res.json(recommendations);
        }
        catch (error) {
            console.error('[getRecommendationCourses]', error);
            res.status(500).json({ message: 'Kai error bentar, tapi masih sayang kamu. Tunggu sebentar ya ❤️' });
        }
    })];
const getCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log("Fetching course with ID:", id);
        console.log("Request params:", req.params);
        const course = yield models_1.Course.findByPk(id, {
            include: [
                {
                    model: models_1.User,
                    as: 'instructor_Id',
                    attributes: ['firstName', 'lastName', 'photo_path', 'bio']
                },
                {
                    model: models_1.Material,
                    as: 'materials_id',
                    order: [['sequence_order', 'ASC']]
                }
            ]
        });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCourseById = getCourseById;
const getCourseMaterials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const materials = yield models_1.Material.findAll({
            where: { id_course: id },
            order: [['sequence_order', 'ASC']]
        });
        res.json(materials);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCourseMaterials = getCourseMaterials;
const getMaterialById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const material = yield models_1.Material.findByPk(id);
        if (!material) {
            res.status(404).json({ message: 'Material not found' });
            return;
        }
        // Ensure content is properly formatted
        let content = material.content;
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            }
            catch (e) {
                content = { blocks: [] };
            }
        }
        else if (!content || !content.blocks) {
            content = { blocks: [] };
        }
        // Return material with properly formatted content
        res.json(Object.assign(Object.assign({}, material.toJSON()), { content }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMaterialById = getMaterialById;
// For Tutor
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, category, description, price, id_user } = req.body;
        const thumbnail_path = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || '';
        const newCourse = yield models_1.Course.create({
            id_course: (0, uuid_1.v4)(),
            title,
            category,
            description,
            price: parseFloat(price),
            thumbnail_path,
            id_user
        });
        res.status(201).json(newCourse);
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});
exports.createCourse = createCourse;
const getCoursesByInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_user } = req.params;
        // 1. Ambil semua course milik instructor
        const courses = yield models_1.Course.findAll({
            where: { id_user },
            include: [
                {
                    model: models_1.Material,
                    as: 'materials_id'
                }
            ]
        });
        const courseIds = courses.map(course => course.id_course);
        // 2. Ambil semua transaksi 'completed' untuk course tersebut
        const completedTransactions = yield Transaction_1.Transaction.findAll({
            where: {
                id_course: { [sequelize_1.Op.in]: courseIds },
                status: 'completed'
            },
            attributes: ['id_course', 'id_user']
        });
        // 3. Hitung student unik per course
        const studentCountMap = {};
        for (const tx of completedTransactions) {
            const courseId = tx.id_course;
            const userId = tx.id_user;
            if (!studentCountMap[courseId]) {
                studentCountMap[courseId] = new Set();
            }
            studentCountMap[courseId].add(userId);
        }
        // 4. Tambahkan properti `totalStudents` ke setiap course
        const enrichedCourses = courses.map(course => {
            var _a;
            const courseId = course.id_course;
            const studentCount = ((_a = studentCountMap[courseId]) === null || _a === void 0 ? void 0 : _a.size) || 0;
            return Object.assign(Object.assign({}, course.toJSON()), { totalStudents: studentCount });
        });
        res.json(enrichedCourses);
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});
exports.getCoursesByInstructor = getCoursesByInstructor;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_course } = req.params;
        const { title, category, description, price } = req.body;
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file); // Cek apakah file terupload
        const course = yield models_1.Course.findByPk(id_course);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        // Update data course
        course.title = title;
        course.category = category;
        course.description = description;
        course.price = parseFloat(price);
        // Jika ada file yang diupload
        if (req.file) {
            // Hapus file lama jika ada
            if (course.thumbnail_path) {
                try {
                    fs_1.default.unlinkSync(course.thumbnail_path);
                }
                catch (err) {
                    console.error('Error deleting old thumbnail:', err);
                }
            }
            course.thumbnail_path = req.file.path;
        }
        yield course.save();
        res.json(course);
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield models_1.Course.findByPk(id);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        yield course.destroy();
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});
exports.deleteCourse = deleteCourse;
