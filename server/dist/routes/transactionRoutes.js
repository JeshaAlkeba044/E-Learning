"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.use(authMiddleware_1.authenticate);
router.post('/transactions', transactionController_1.createTransaction);
router.get('/transactions', transactionController_1.getUserTransactions);
router.get('/enrolled-courses', transactionController_1.getUserEnrolledCourses);
router.get('/transactions/:orderId/status', transactionController_1.checkTransactionStatus);
// Webhook for Midtrans notifications (no authentication)
router.post('/payment-notification', express_1.default.json(), transactionController_1.paymentNotification);
exports.default = router;
