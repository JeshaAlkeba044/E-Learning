import { Request, Response } from 'express';
import { Transaction, Course, User } from '../models';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { id, paymentMethod, amount } = req.body;
    const userId = req.user?.id_user; // From auth middleware
    
    // Check if course exists
    const course = await Course.findByPk(id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return 
    }
    
    // Check if user already enrolled
    const existingTransaction = await Transaction.findOne({
      where: { id_user: userId, id_course: id }
    });
    
    if (existingTransaction) {
        res.status(400).json({ message: 'You are already enrolled in this course' });
        return 
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      id_user: userId,
      id_course: id,
      amount,
      payment_method: paymentMethod,
      status: 'completed' // In real app, you'd verify payment first
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;
    
    const transactions = await Transaction.findAll({
      where: { id_user: userId },
      include: [{
        model: Course,
        as: 'course'
      }],
      order: [['transaction_date', 'DESC']]
    });

    if (!transactions || transactions.length === 0) {
      res.status(404).json({ message: 'No transactions found' });
      return;
    }
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
