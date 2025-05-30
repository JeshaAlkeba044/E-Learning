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
exports.getUserEnrolledCourses = exports.getUserTransactions = exports.createTransaction = void 0;
const models_1 = require("../models");
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, paymentMethod, amount, voucher } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user; // From auth middleware
        console.log("fdsfsfs", req.body);
        // Validate required fields
        // if (!id || !paymentMethod || !amount) {
        //   res.status(400).json({ 
        //     success: false,
        //     message: 'Missing required fields' 
        //   });
        //   return 
        // }
        // Check if course exists
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
            where: { id_user: userId, id_course: id }
        });
        if (existingTransaction) {
            res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
            return;
        }
        // Apply voucher discount if valid (example implementation)
        let finalAmount = parseFloat(amount);
        if (voucher === 'DISKON10') {
            finalAmount = finalAmount * 0.9; // 10% discount
        }
        else if (voucher === 'DISKON20') {
            finalAmount = finalAmount * 0.8; // 20% discount
        }
        // Create transaction
        const transaction = yield models_1.Transaction.create({
            id_user: userId,
            id_course: id,
            amount: finalAmount,
            payment_method: paymentMethod,
            status: 'pending' // In real app, you'd verify payment first
        });
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
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
exports.createTransaction = createTransaction;
const getUserTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
        const { id } = req.query;
        console.log("\n\n\n\n\n\nid", id);
        const whereClause = { id_user: userId };
        if (id) {
            whereClause.id_course = id;
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
