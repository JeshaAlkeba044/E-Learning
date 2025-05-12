import { Router } from 'express';
import { getTutors, deleteTutor, verifyPayment, getMonthlyTransactionStats, verifyTutor, getPendingTransactions, getUnverifiedTutors} from '../controllers/adminController';

const router = Router();

router.get('pendingPayment', getPendingTransactions); //get all pending payment
router.put('/payment/:id/verify', verifyPayment); //verify payment
router.get('/allTutors', getTutors); //get all tutors
router.delete('/deleteTutors/:id', deleteTutor); //delete a tutor
router.get('/transactionMonthtly', getMonthlyTransactionStats); //get all transactions
router.put('/verifyTutor/:id', verifyTutor); //verify a tutor
router.put('/unverifiedTutor', getUnverifiedTutors); //unverify a tutor

export default router;