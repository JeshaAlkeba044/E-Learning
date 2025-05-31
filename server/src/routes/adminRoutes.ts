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
    getStatistik,
    getAll,
    addAdmin
  } from "../controllers/adminController";

  const router = Router();
  router.get("/pendingPayment", getPendingTransactions); 
  router.put("/payment/:id", verifyPayment);      
  router.get("/allTutors", getTutors);                   
  router.delete("/deleteTutors/:id", deleteTutor);       
  router.get("/transactionMonthtly", getMonthlyTransactionStats); 
  router.put("/verifyTutor/:id", verifyTutor);            
  router.get("/unverifiedTutor", getUnverifiedTutors);    
  router.get("/dashboardSummary", getDashboardSummary);

  router.get('/statistik', getStatistik);
  router.get('/getAll', getAll);
  router.post('/addAdmin', addAdmin);


  export default router;
