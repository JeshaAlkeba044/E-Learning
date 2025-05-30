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
exports.getDashboardSummary = exports.getMonthlyTransactionStats = exports.verifyPayment = exports.getPendingTransactions = exports.getUnverifiedTutors = exports.verifyTutor = exports.deleteTutor = exports.getTutors = void 0;
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const Course_1 = require("../models/Course");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const sequelize_1 = require("sequelize");
const dayjs_1 = __importDefault(require("dayjs"));
const getTutors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.findAll({
            attributes: { exclude: ['password'] },
        });
        const tutors = [];
        for (const user of users) {
            const decryptedRole = yield (0, cryptoUtil_1.decrypt)(user.role);
            if (decryptedRole === 'tutor') {
                const decryptedEmail = yield (0, cryptoUtil_1.decrypt)(user.encryptedEmail);
                const decryptedFirstName = yield (0, cryptoUtil_1.decrypt)(user.firstName);
                const decryptedLastName = yield (0, cryptoUtil_1.decrypt)(user.lastName);
                const decryptedSpecialization = yield (0, cryptoUtil_1.decrypt)(user.specialization);
                const decryptedExperience = yield (0, cryptoUtil_1.decrypt)(user.YoE);
                const decryptedBio = yield (0, cryptoUtil_1.decrypt)(user.bio);
                // const decryptedPortofolio = await decrypt(user.linkPorto);
                const tutorData = Object.assign(Object.assign({}, user.toJSON()), { email: decryptedEmail, firstName: decryptedFirstName, lastName: decryptedLastName, specialization: decryptedSpecialization, YoE: decryptedExperience, bio: decryptedBio });
                tutors.push(tutorData);
            }
        }
        res.status(200).json(tutors);
    }
    catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ message: 'Error fetching tutors', error });
    }
});
exports.getTutors = getTutors;
const deleteTutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedUser = yield User_1.User.destroy({ where: { id_user: id } });
        if (deletedUser > 0) {
            res.status(200).json({ message: 'Tutor deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Tutor not found' });
        }
    }
    catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ message: 'Error deleting tutor', error });
    }
});
exports.deleteTutor = deleteTutor;
const verifyTutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield User_1.User.findOne({ where: { id_user: id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const decryptedRole = yield (0, cryptoUtil_1.decrypt)(user.role);
        if (decryptedRole !== 'tutor') {
            res.status(403).json({ message: 'User is not a tutor' });
        }
        yield User_1.User.update({ statusUser: 'verified' }, { where: { id_user: id } });
        res.status(200).json({ message: 'Tutor verified successfully' });
    }
    catch (error) {
        console.error('Error verifying tutor:', error);
        res.status(500).json({ message: 'Error verifying tutor', error });
    }
});
exports.verifyTutor = verifyTutor;
const getUnverifiedTutors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.findAll({
            where: {
                statusUser: 'none'
            },
            attributes: {
                exclude: ['password']
            }
        });
        const unverifiedTutors = users.filter((user) => {
            user.firstName = (0, cryptoUtil_1.decrypt)(user.firstName);
            user.lastName = (0, cryptoUtil_1.decrypt)(user.lastName);
            const decryptedRole = (0, cryptoUtil_1.decrypt)(user.role);
            return decryptedRole === 'tutor';
        });
        res.status(200).json({
            message: unverifiedTutors.length === 0 ? 'Tidak ada tutor yang perlu diverifikasi' : undefined,
            data: unverifiedTutors
        });
    }
    catch (error) {
        console.error('Error fetching unverified tutors:', error);
        res.status(500).json({ message: 'Error fetching unverified tutors', error });
    }
});
exports.getUnverifiedTutors = getUnverifiedTutors;
const getPendingTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingTransactions = yield Transaction_1.Transaction.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User_1.User,
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: Course_1.Course,
                    attributes: ['title']
                }
            ],
            order: [['transaction_date', 'DESC']]
        });
        const formattedTransactions = yield Promise.all(pendingTransactions.map((trx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const decryptedFirstName = yield (0, cryptoUtil_1.decrypt)(((_a = trx.user) === null || _a === void 0 ? void 0 : _a.firstName) || '');
            const decryptedLastName = yield (0, cryptoUtil_1.decrypt)(((_b = trx.user) === null || _b === void 0 ? void 0 : _b.lastName) || '');
            return {
                id_transaction: trx.id_transaction,
                transaction_date: trx.transaction_date,
                amount: trx.amount,
                payment_method: trx.payment_method,
                status: trx.status,
                user: {
                    name: `${decryptedFirstName} ${decryptedLastName}`.trim()
                },
                course: {
                    title: ((_c = trx.course) === null || _c === void 0 ? void 0 : _c.title) || '-'
                }
            };
        })));
        res.json({ success: true, data: formattedTransactions });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data transaksi' });
    }
});
exports.getPendingTransactions = getPendingTransactions;
// Verifikasi status pembayaran transaksi
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = req.params.id;
    try {
        const transaction = yield Transaction_1.Transaction.findByPk(transactionId);
        if (!transaction) {
            res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
            return;
        }
        transaction.status = 'completed';
        yield transaction.save();
        res.json({ success: true, message: 'Transaksi berhasil diverifikasi' });
    }
    catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memverifikasi transaksi' });
    }
});
exports.verifyPayment = verifyPayment;
const getMonthlyTransactionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield Transaction_1.Transaction.findAll({
            where: {
                status: 'success'
            },
            include: [
                {
                    model: User_1.User,
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Course_1.Course
                }
            ],
            order: [['transaction_date', 'ASC']]
        });
        // Kelompokkan transaksi berdasarkan bulan
        const grouped = {};
        transactions.forEach(tx => {
            const monthKey = (0, dayjs_1.default)(tx.transaction_date).startOf('month').format('YYYY-MM');
            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    month: (0, dayjs_1.default)(tx.transaction_date).startOf('month').toDate(),
                    total_amount: 0,
                    transactions: []
                };
            }
            grouped[monthKey].total_amount += tx.amount;
            grouped[monthKey].transactions.push(tx);
        });
        // Konversi objek jadi array
        const result = Object.values(grouped);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching grouped transactions:', error);
        res.status(500).json({ message: 'Error fetching grouped transactions', error });
    }
});
exports.getMonthlyTransactionStats = getMonthlyTransactionStats;
const getDashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCourses = yield Course_1.Course.count({
            where: { is_active: true },
        });
        const allUsers = yield User_1.User.findAll({
            attributes: ['role']
        });
        const totalLearners = allUsers.filter(user => (0, cryptoUtil_1.decrypt)(user.role) === 'learner').length;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const totalTransactions = yield Transaction_1.Transaction.count({
            where: {
                transaction_date: {
                    [sequelize_1.Op.gte]: startOfMonth,
                    [sequelize_1.Op.lt]: endOfMonth,
                },
                status: 'completed',
            },
        });
        res.json({
            success: true,
            data: {
                totalCourses,
                totalLearners,
                totalTransactions,
            },
        });
    }
    catch (error) {
        const err = error;
        console.error('Error fetching dashboard summary:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getDashboardSummary = getDashboardSummary;
