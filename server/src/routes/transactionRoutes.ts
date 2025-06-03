import express from 'express';
import {
  createTransaction,
  getUserTransactions,
  getUserEnrolledCourses,
  checkTransactionStatus,
  paymentNotification,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.use(authenticate);

router.post('/transactions', createTransaction);
router.get('/transactions', getUserTransactions);
router.get('/enrolled-courses', getUserEnrolledCourses);
router.get('/transactions/:orderId/status', checkTransactionStatus);


// Webhook for Midtrans notifications (no authentication)
router.post('/payment-notification', express.json(), paymentNotification);

export default router;