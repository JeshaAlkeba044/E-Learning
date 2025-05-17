import { Router } from "express";
import cors from "cors";  // Use ES module import style for consistency
import {
  getTutors,
  deleteTutor,
  verifyPayment,
  getMonthlyTransactionStats,
  verifyTutor,
  getPendingTransactions,
  getUnverifiedTutors,
  getDashboardSummary,
} from "../controllers/adminController";

const router = Router();

router.use(cors());  // Apply CORS middleware to this router

// Corrected routes (removed unnecessary backslashes before ':id')
router.get("/admin/pendingPayment", getPendingTransactions); // get all pending payment
router.put("/admin/payment/:id/verify", verifyPayment);      // verify payment
router.get("/admin/allTutors", getTutors);                   // get all tutors
router.delete("/admin/deleteTutors/:id", deleteTutor);       // delete a tutor
router.get("/admin/transactionMonthtly", getMonthlyTransactionStats); // get all transactions
router.put("/admin/verifyTutor/:id", verifyTutor);            // verify a tutor
router.put("/admin/unverifiedTutor", getUnverifiedTutors);    // unverify a tutor
router.get("/admin/dashboardSummary", getDashboardSummary);   // get dashboard summary

export default router;
