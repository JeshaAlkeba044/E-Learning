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
exports.getAll = exports.getStatistik = exports.getDashboardSummary = exports.getMonthlyTransactionStats = exports.verifyPayment = exports.getPendingTransactions = exports.getUnverifiedTutors = exports.verifyTutor = exports.deleteTutor = exports.getTutors = exports.addAdmin = void 0;
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const Course_1 = require("../models/Course");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const sequelize_1 = require("sequelize");
const dayjs_1 = __importDefault(require("dayjs"));
const sequelize_2 = __importDefault(require("sequelize"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../services/emailService");
const midtrans_1 = require("../utils/midtrans");
const addAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, phone_number } = req.body;
        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ message: "Data tidak lengkap" });
        }
        const encryptedEmail = (0, cryptoUtil_1.encrypt)(email);
        const hashedEmail = (0, cryptoUtil_1.hashEmail)(email);
        const existing = yield User_1.User.findOne({ where: { encryptedEmail } });
        if (existing) {
            res.status(409).json({ message: "Email sudah terdaftar" });
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        const newAdmin = yield User_1.User.create({
            firstName: (0, cryptoUtil_1.encrypt)(firstName),
            lastName: (0, cryptoUtil_1.encrypt)(lastName),
            hashEmail: hashedEmail,
            encryptedEmail,
            password: hashPassword,
            phone_number: (0, cryptoUtil_1.encrypt)(phone_number),
            role: (0, cryptoUtil_1.encrypt)("admin"),
            statusUser: "verified",
        });
        res.status(201).json({
            message: "Admin berhasil ditambahkan",
            admin: {
                id: newAdmin.id,
                email,
                firstName,
                lastName,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan admin" });
    }
});
exports.addAdmin = addAdmin;
const getTutors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.findAll({
            attributes: { exclude: ['password'] },
        });
        const tutors = [];
        for (const user of users) {
            const decryptedRole = user.role;
            console.log("\n\n\nUSER ADMIN: ", user);
            if (decryptedRole === 'tutor') {
                const decryptedEmail = (0, cryptoUtil_1.decrypt)(user.encryptedEmail);
                const decryptedFirstName = user.firstName;
                const decryptedLastName = user.lastName;
                const decryptedSpecialization = user.specialization;
                const decryptedExperience = user.YoE;
                const decryptedBio = user.bio;
                // const decryptedPortofolio = await decrypt(user.linkPorto);
                const tutorData = Object.assign(Object.assign({}, user.toJSON()), { email: decryptedEmail, firstName: decryptedFirstName, lastName: decryptedLastName, specialization: decryptedSpecialization, phone_number: user.phone_number, YoE: decryptedExperience, bio: decryptedBio });
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
    var _a, _b, _c;
    const transactionId = req.params.id;
    try {
        const transaction = yield Transaction_1.Transaction.findByPk(transactionId, {
            include: [
                {
                    model: User_1.User,
                    attributes: ['id_user', 'firstName', 'lastName', 'encryptedEmail']
                },
                {
                    model: Course_1.Course,
                    attributes: ['id_course', 'title']
                }
            ]
        });
        if (!transaction) {
            res.status(404).json({
                success: false,
                message: 'Transaction not found in database'
            });
            return;
        }
        // Skip Midtrans check if already completed in our database
        if (transaction.status === 'completed') {
            res.json({
                success: true,
                message: 'Transaction already completed',
                data: transaction
            });
            return;
        }
        // Check with Midtrans only for pending transactions
        let statusResponse;
        try {
            statusResponse = yield midtrans_1.snap.transaction.status(transactionId);
        }
        catch (midtransError) {
            // If Midtrans returns 404, check if we have enough data locally
            if (midtransError.httpStatusCode === '404') {
                // For demo purposes, we'll mark as completed if amount > 0
                if (transaction.amount > 0) {
                    transaction.status = 'completed';
                    yield transaction.save();
                    // Send success email
                    if (transaction.user) {
                        const email = (0, cryptoUtil_1.decrypt)(transaction.user.encryptedEmail);
                        const firstName = (0, cryptoUtil_1.decrypt)(transaction.user.firstName);
                        yield (0, emailService_1.sendOTPEmail)({
                            email,
                            type: 'payment_success',
                            data: {
                                name: firstName,
                                courseName: ((_a = transaction.course) === null || _a === void 0 ? void 0 : _a.title) || 'the course',
                                amount: transaction.amount,
                                transactionId: transaction.id_transaction
                            }
                        });
                    }
                    res.json({
                        success: true,
                        message: 'Transaction marked as completed (Midtrans not found)',
                        data: transaction
                    });
                    return;
                }
            }
            console.error('Midtrans error:', midtransError);
            res.status(500).json({
                success: false,
                message: 'Error verifying with Midtrans',
                error: midtransError.message
            });
            return;
        }
        const transactionStatus = statusResponse.transaction_status;
        const paymentType = statusResponse.payment_type;
        const fraudStatus = statusResponse.fraud_status;
        let status = transaction.status;
        let emailType = 'otp';
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                status = 'challenge';
                emailType = 'payment_challenge';
            }
            else if (fraudStatus === 'accept') {
                status = 'completed';
                emailType = 'payment_success';
            }
        }
        else if (transactionStatus === 'settlement') {
            status = 'completed';
            emailType = 'payment_success';
        }
        else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            status = 'failed';
            emailType = 'payment_failed';
        }
        // Update transaction
        transaction.status = status;
        if (paymentType) {
            transaction.payment_method = paymentType;
        }
        yield transaction.save();
        // Send email notification if status changed
        if (emailType !== 'otp' && transaction.user) {
            const email = (0, cryptoUtil_1.decrypt)(transaction.user.encryptedEmail);
            const firstName = (0, cryptoUtil_1.decrypt)(transaction.user.firstName);
            yield (0, emailService_1.sendOTPEmail)({
                email,
                type: emailType,
                data: {
                    name: firstName,
                    courseName: ((_b = transaction.course) === null || _b === void 0 ? void 0 : _b.title) || 'the course',
                    amount: transaction.amount,
                    transactionId: transaction.id_transaction
                }
            });
        }
        res.json({
            success: true,
            message: 'Transaction status updated',
            data: {
                id: transaction.id_transaction,
                status: transaction.status,
                payment_method: transaction.payment_method,
                amount: transaction.amount,
                course: (_c = transaction.course) === null || _c === void 0 ? void 0 : _c.title
            }
        });
        return;
    }
    catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
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
        const totalLearners = allUsers.filter(user => user.role === 'learner').length;
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
const getMonthName = (month) => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
};
const getStatistik = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { year, month } = req.query;
    console.log('Headers:', req.headers); // Log headers yang diterima
    console.log('Query:', req.query); // Log parameter query
    const yearParam = year;
    const monthParam = month;
    const whereClause = {};
    if (yearParam && yearParam !== 'al  l' && !isNaN(parseInt(yearParam))) {
        const parsedYear = parseInt(yearParam);
        whereClause[sequelize_1.Op.and] = [
            sequelize_2.default.where(sequelize_2.default.fn('YEAR', sequelize_2.default.col('created_at')), parsedYear)
        ];
        if (monthParam && monthParam !== 'all' && !isNaN(parseInt(monthParam))) {
            const parsedMonth = parseInt(monthParam);
            whereClause[sequelize_1.Op.and].push(sequelize_2.default.where(sequelize_2.default.fn('MONTH', sequelize_2.default.col('created_at')), parsedMonth));
        }
    }
    try {
        const transactions = yield Transaction_1.Transaction.findAll({ where: whereClause });
        if (!transactions.length) {
            // Jika tidak ada transaksi, tetap kirimkan 12 bulan kosong
            const currentYear = parseInt(yearParam) || new Date().getFullYear();
            const months = Array.from({ length: 12 }, (_, i) => `${getMonthName(i + 1)} ${currentYear}`);
            res.json({
                summary: {
                    totalTransactions: 0,
                    totalRevenue: 0,
                    avgMonthly: 0,
                    bestMonth: "-",
                },
                table: months.map(month => ({
                    monthName: month,
                    transactionCount: 0,
                    totalRevenue: 0,
                    avgPerTransaction: 0,
                })),
                chart: {
                    months,
                    revenue: Array(12).fill(0),
                    transactions: Array(12).fill(0),
                }
            });
        }
        const summary = {
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((acc, t) => acc + (t.amount || 0), 0),
            avgMonthly: 0,
            bestMonth: '',
        };
        // Group transaksi per bulan
        const grouped = transactions.reduce((acc, t) => {
            const date = new Date(t.created_at);
            const m = date.getMonth() + 1;
            const y = date.getFullYear();
            const key = `${m}-${y}`;
            if (!acc[key])
                acc[key] = [];
            acc[key].push(t);
            return acc;
        }, {});
        // Bangun data bulanan untuk 12 bulan
        const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
        const yearForStats = parseInt(yearParam) || new Date().getFullYear();
        const monthMap = {};
        for (const m of allMonths) {
            const key = `${m}-${yearForStats}`;
            const txs = grouped[key] || [];
            const revenue = txs.reduce((acc, t) => acc + (t.amount || 0), 0);
            const avg = txs.length ? revenue / txs.length : 0;
            monthMap[key] = {
                monthName: `${getMonthName(m)} ${yearForStats}`,
                transactionCount: txs.length,
                totalRevenue: revenue,
                avgPerTransaction: Math.round(avg),
            };
        }
        const table = allMonths.map(m => {
            const key = `${m}-${yearForStats}`;
            return monthMap[key];
        });
        const monthsWithData = table.filter(row => row.transactionCount > 0);
        if (monthsWithData.length > 0) {
            const sortedByRevenue = [...monthsWithData].sort((a, b) => b.totalRevenue - a.totalRevenue);
            summary.bestMonth = sortedByRevenue[0].monthName;
            summary.avgMonthly = Math.round(summary.totalRevenue / monthsWithData.length);
        }
        else {
            summary.bestMonth = "-";
            summary.avgMonthly = 0;
        }
        const chart = {
            months: table.map(row => row.monthName),
            revenue: table.map(row => row.totalRevenue),
            transactions: table.map(row => row.transactionCount),
        };
        res.json({ summary, table, chart });
    }
    catch (error) {
        console.error("Error getStatistik:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getStatistik = getStatistik;
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield Transaction_1.Transaction.findAll({
            include: [
                {
                    model: User_1.User,
                    attributes: ['id_user', 'firstName', 'lastName', 'role'],
                },
                {
                    model: Course_1.Course,
                    attributes: ['id_course', 'title'],
                    include: [
                        {
                            model: User_1.User,
                            as: 'instructor_Id', // sesuai alias di model Course
                            attributes: ['id_user', 'firstName', 'lastName'],
                        },
                    ],
                },
            ],
            order: [['transaction_date', 'DESC']],
        });
        // Fungsi enkripsi base64 biar aman tampilannya
        const encrypt = (text) => Buffer.from(text).toString('base64');
        // Mapping data dan encrypt nama learner & instructor
        const result = transactions.map((trx) => {
            const learner = trx.user;
            const course = trx.course;
            const instructor = course === null || course === void 0 ? void 0 : course.instructor_Id;
            return {
                id_transaction: trx.id_transaction,
                transaction_date: trx.transaction_date,
                amount: trx.amount,
                payment_method: trx.payment_method,
                status: trx.status,
                created_at: trx.created_at,
                updated_at: trx.updated_at,
                learner: {
                    id_user: learner.id_user,
                    firstName: (0, cryptoUtil_1.decrypt)(learner.firstName),
                    lastName: (0, cryptoUtil_1.decrypt)(learner.lastName),
                    role: learner.role,
                },
                course: {
                    id_course: course === null || course === void 0 ? void 0 : course.id_course,
                    title: course === null || course === void 0 ? void 0 : course.title,
                    instructor: instructor
                        ? {
                            id_user: instructor.id_user,
                            firstName: (0, cryptoUtil_1.decrypt)(instructor.firstName),
                            lastName: (0, cryptoUtil_1.decrypt)(instructor.lastName),
                        }
                        : null,
                },
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error('🔥 Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.getAll = getAll;
