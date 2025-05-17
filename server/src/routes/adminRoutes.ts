import { Router } from "express";
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
router.get("/pendingPayment", getPendingTransactions); 
router.put("/payment/:id/verify", verifyPayment);      
router.get("/allTutors", getTutors);                   
router.delete("/deleteTutors/:id", deleteTutor);       
router.get("/transactionMonthtly", getMonthlyTransactionStats); 
router.put("/verifyTutor/:id", verifyTutor);            
router.get("/unverifiedTutor", getUnverifiedTutors);    
router.get("/dashboardSummary", getDashboardSummary);

export default router;
