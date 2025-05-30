import { Request, Response } from 'express';
import { Transaction, Course, User } from '../models';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { id, paymentMethod, amount, voucher } = req.body;
    const userId = req.user?.id_user; // From auth middleware
    
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
    const course = await Course.findByPk(id);
    if (!course) {
      res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
      return 
    }
    
    // Check if user already enrolled
    const existingTransaction = await Transaction.findOne({
      where: { id_user: userId, id_course: id }
    });
    
    if (existingTransaction) {
      res.status(400).json({ 
        success: false,
        message: 'You are already enrolled in this course' 
      });
      return 
    }
    
    // Apply voucher discount if valid (example implementation)
    let finalAmount = parseFloat(amount);
    if (voucher === 'DISKON10') {
      finalAmount = finalAmount * 0.9; // 10% discount
    } else if (voucher === 'DISKON20') {
      finalAmount = finalAmount * 0.8; // 20% discount
    }

    // Create transaction
    const transaction = await Transaction.create({
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
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
    return 
  }
};


export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;
    const { id } = req.query;

    console.log("\n\n\n\n\n\nid", id);
    
    const whereClause: any = { id_user: userId };
    if (id) {
      whereClause.id_course = id;
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [{
        model: Course,
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
      return 
    }
    
    res.json({
      success: true,
      data: transactions
    });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
    return 
  }
};

export const getUserEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;

    const successfulTransactions = await Transaction.findAll({
      where: {
        id_user: userId,
        status: 'success' // Hanya transaksi yang berhasil
      },
      include: [{
        model: Course,
        as: 'course'
      }],
      order: [['transaction_date', 'DESC']]
    });

    // Extract hanya kursusnya
    const enrolledCourses = successfulTransactions.map(transaction => transaction.course);

    res.json(enrolledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
