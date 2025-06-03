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
exports.verifyPayment = exports.getUserEnrolledCourses = exports.getUserTransactions = exports.checkTransactionStatus = exports.paymentNotification = exports.createTransaction = exports.getStatistik = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const midtrans_1 = require("../utils/midtrans");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const emailService_1 = require("../services/emailService");
const getStatistik = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { year, month } = req.query;
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const whereClause = {};
    if (!isNaN(parsedYear)) {
        whereClause[sequelize_1.Op.and] = [
            sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('YEAR', sequelize_1.Sequelize.col('created_at')), parsedYear),
        ];
        if (month && !isNaN(parsedMonth)) {
            whereClause[sequelize_1.Op.and].push(sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('MONTH', sequelize_1.Sequelize.col('created_at')), parsedMonth));
        }
    }
    try {
        const transactions = yield models_1.Transaction.findAll({ where: whereClause });
        if (!transactions.length) {
            res.json({
                summary: {
                    totalTransactions: 0,
                    totalRevenue: 0,
                    avgMonthly: 0,
                    bestMonth: "-",
                },
                table: [],
                chart: {
                    months: [],
                    revenue: [],
                    transactions: [],
                }
            });
        }
        const summary = {
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((acc, t) => acc + (t.amount || 0), 0),
            avgMonthly: 0,
            bestMonth: '',
        };
        // Kelompokkan transaksi per bulan
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
        // Buat data untuk tabel
        const table = Object.entries(grouped).map(([key, txs]) => {
            const [m, y] = key.split("-");
            const transactionsArray = txs;
            const revenue = transactionsArray.reduce((acc, t) => acc + (t.amount || 0), 0);
            const avg = revenue / transactionsArray.length;
            return {
                monthName: `${getMonthName(+m)} ${y}`,
                transactionCount: transactionsArray.length,
                totalRevenue: revenue,
                avgPerTransaction: Math.round(avg),
            };
        });
        // Bulan terbaik berdasarkan total revenue
        const sortedByRevenue = [...table].sort((a, b) => b.totalRevenue - a.totalRevenue);
        summary.bestMonth = sortedByRevenue[0].monthName;
        summary.avgMonthly = Math.round(summary.totalRevenue / Object.keys(grouped).length);
        const chart = {
            months: table.map(row => row.monthName),
            revenue: table.map(row => row.totalRevenue),
            transactions: table.map(row => row.transactionCount),
        };
        res.json({ summary, table, chart });
    }
    catch (error) {
        console.error("💥 Error getStatistik:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getStatistik = getStatistik;
function getMonthName(month) {
    return [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ][month - 1] || '';
}
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { id, paymentMethod, amount, voucher } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        const course = yield models_1.Course.findByPk(id);
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        // Check if user already enrolled
        const existingTransaction = yield models_1.Transaction.findOne({
            where: {
                id_user: userId,
                id_course: id,
                status: ['completed', 'pending']
            }
        });
        if (existingTransaction) {
            res.status(400).json({
                success: false,
                message: 'You already have a transaction for this course'
            });
            return;
        }
        // Calculate final amount
        let finalAmount = parseFloat(amount);
        if (voucher === 'DISKON10') {
            finalAmount = finalAmount * 0.9;
        }
        else if (voucher === 'DISKON20') {
            finalAmount = finalAmount * 0.8;
        }
        // Generate transaction ID
        const orderId = `EDU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Create transaction in database first
        const newTransaction = yield models_1.Transaction.create({
            id_transaction: orderId,
            id_user: userId,
            id_course: id,
            amount: finalAmount,
            payment_method: 'midtrans', // Will be updated from Midtrans response
            status: 'pending',
            transaction_date: new Date()
        });
        // Prepare Midtrans parameters
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: finalAmount
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: (0, cryptoUtil_1.decrypt)(((_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName) || ""),
                last_name: (0, cryptoUtil_1.decrypt)(((_c = req.user) === null || _c === void 0 ? void 0 : _c.lastName) || ""),
                email: (0, cryptoUtil_1.decrypt)(((_d = req.user) === null || _d === void 0 ? void 0 : _d.encryptedEmail) || ""),
                phone: (0, cryptoUtil_1.decrypt)(((_e = req.user) === null || _e === void 0 ? void 0 : _e.phone_number) || "")
            },
            callbacks: {
                finish: `http://localhost:5502/client/courses/course_detail.html?id=${id}#payment-complete`,
                error: `http://localhost:5502/client/courses/course_detail.html?id=${id}`,
                pending: `http://localhost:5502/client/courses/course_detail.html?id=${id}`
            }
        };
        // Create Midtrans transaction
        const midtransTransaction = yield midtrans_1.snap.createTransaction(parameter);
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: {
                transaction: {
                    id: orderId,
                    amount: finalAmount,
                    status: 'pending'
                },
                payment_token: midtransTransaction.token,
                redirect_url: midtransTransaction.redirect_url
            }
        });
        return;
    }
    catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
});
exports.createTransaction = createTransaction;
const paymentNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notificationJson = req.body;
        // Verify notification with Midtrans
        const statusResponse = yield midtrans_1.snap.transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type;
        console.log(`Transaction notification. Order ID: ${orderId}. Status: ${transactionStatus}`);
        // Find transaction in database
        const transaction = yield models_1.Transaction.findByPk(orderId, {
            include: [
                {
                    model: models_1.User,
                    attributes: ['id_user', 'firstName', 'lastName', 'encryptedEmail']
                },
                {
                    model: models_1.Course,
                    attributes: ['id_course', 'title']
                }
            ]
        });
        if (!transaction) {
            console.error(`Transaction ${orderId} not found in database`);
            res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
            return;
        }
        // Determine status and email type
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
        // Send email notification if needed
        if (emailType !== 'otp' && transaction.user) {
            const email = (0, cryptoUtil_1.decrypt)(transaction.user.encryptedEmail);
            const firstName = (0, cryptoUtil_1.decrypt)(transaction.user.firstName);
            yield (0, emailService_1.sendOTPEmail)({
                email,
                type: emailType,
                data: {
                    name: firstName,
                    courseName: ((_a = transaction.course) === null || _a === void 0 ? void 0 : _a.title) || 'the course',
                    amount: transaction.amount,
                    transactionId: transaction.id_transaction
                }
            });
        }
        res.status(200).send('OK');
        return;
    }
    catch (error) {
        console.error('Error handling payment notification:', error);
        res.status(500).send('Error processing notification');
        return;
    }
});
exports.paymentNotification = paymentNotification;
const checkTransactionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Check in database first
        const transaction = yield models_1.Transaction.findByPk(orderId);
        if (!transaction) {
            res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
            return;
        }
        // If already completed in our database, return that
        if (transaction.status === 'completed') {
            res.json({
                success: true,
                data: {
                    status: 'completed',
                    transaction
                }
            });
            return;
        }
        // Otherwise check with Midtrans
        const statusResponse = yield midtrans_1.snap.transaction.status(orderId);
        // Update our database based on Midtrans status
        if (statusResponse.transaction_status === 'settlement' ||
            statusResponse.transaction_status === 'capture') {
            yield models_1.Transaction.update({ status: 'completed' }, { where: { id_transaction: orderId } });
        }
        res.json({
            success: true,
            data: {
                status: statusResponse.transaction_status,
                transaction: Object.assign(Object.assign({}, transaction.toJSON()), { status: statusResponse.transaction_status === 'settlement' ||
                        statusResponse.transaction_status === 'capture' ?
                        'completed' : transaction.status })
            }
        });
    }
    catch (error) {
        console.error('Error checking transaction status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transaction status'
        });
    }
});
exports.checkTransactionStatus = checkTransactionStatus;
const getUserTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        const { courseId } = req.query;
        console.log("\n\n\n\n\n\nid", courseId);
        const whereClause = { id_user: userId };
        if (courseId) {
            whereClause.id_course = courseId;
        }
        const transactions = yield models_1.Transaction.findAll({
            where: whereClause,
            include: [{
                    model: models_1.Course,
                    as: 'course'
                }],
            order: [['transaction_date', 'DESC']]
        });
        console.log("n\n\n\n\n=========\ntransactions", transactions);
        if (!transactions || transactions.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No transactions found'
            });
            return;
        }
        res.json({
            success: true,
            data: transactions
        });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
        return;
    }
});
exports.getUserTransactions = getUserTransactions;
const getUserEnrolledCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        const successfulTransactions = yield models_1.Transaction.findAll({
            where: {
                id_user: userId,
                status: 'success' // Hanya transaksi yang berhasil
            },
            include: [{
                    model: models_1.Course,
                    as: 'course'
                }],
            order: [['transaction_date', 'DESC']]
        });
        // Extract hanya kursusnya
        const enrolledCourses = successfulTransactions.map(transaction => transaction.course);
        res.json(enrolledCourses);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserEnrolledCourses = getUserEnrolledCourses;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transactionId = req.params.id;
    try {
        const transaction = yield models_1.Transaction.findByPk(transactionId, {
            include: [
                {
                    model: models_1.User,
                    attributes: ['id_user', 'firstName', 'lastName', 'encryptedEmail']
                },
                {
                    model: models_1.Course,
                    attributes: ['id_course', 'title']
                }
            ]
        });
        if (!transaction) {
            res.status(404).json({ success: false, message: 'Transaction not found' });
            return;
        }
        // Check with Midtrans for latest status
        const statusResponse = yield midtrans_1.snap.transaction.status(transactionId);
        const transactionStatus = statusResponse.transaction_status;
        const paymentType = statusResponse.payment_type;
        let status = transaction.status;
        let emailType = 'otp';
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            status = 'completed';
            emailType = 'payment_success';
        }
        else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            status = 'failed';
            emailType = 'payment_failed';
        }
        // Update transaction with payment method from Midtrans
        transaction.status = status;
        if (paymentType) {
            transaction.payment_method = paymentType;
        }
        yield transaction.save();
        // Send email notification if status changed
        if (emailType && transaction.user) {
            const email = (0, cryptoUtil_1.decrypt)(transaction.user.encryptedEmail);
            const firstName = (0, cryptoUtil_1.decrypt)(transaction.user.firstName);
            yield (0, emailService_1.sendOTPEmail)({
                email,
                type: emailType,
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
            message: 'Transaction verified successfully',
            data: {
                status: transaction.status,
                payment_method: transaction.payment_method
            }
        });
    }
    catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ success: false, message: 'Error verifying transaction', error });
    }
});
exports.verifyPayment = verifyPayment;
