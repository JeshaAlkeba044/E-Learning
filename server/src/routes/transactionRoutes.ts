import express from 'express';
import {
  createTransaction,
  getUserTransactions,
  getUserEnrolledCourses
} from '../controllers/transactionController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.use(authenticate);

router.post('/transactions', createTransaction);
router.get('/transactions', getUserTransactions);
router.get('/enrolled-courses', getUserEnrolledCourses);

export default router;