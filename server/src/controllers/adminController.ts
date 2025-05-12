import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Course } from '../models/Course';

// Ambil semua tutor (user dengan role 'tutor')
export const getTutors = async (req: Request, res: Response) => {
  try {
    const tutors = await User.findAll({
      where: { role: 'tutor' },
      attributes: { exclude: ['password'] },
    });

    res.status(200).json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors', error });
  }
};

// Hapus user berdasarkan id (khusus tutor)
export const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.destroy({ where: { id_user: id, role: 'tutor' } });

    if (deletedUser > 0) {
      res.status(200).json({ message: 'Tutor deleted successfully' });
    } else {
      res.status(404).json({ message: 'Tutor not found' });
    }
  } catch (error) {
    console.error('Error deleting tutor:', error);
    res.status(500).json({ message: 'Error deleting tutor', error });
  }
};

// Verifikasi tutor berdasarkan id
export const verifyTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [updated] = await User.update(
      { is_verified: "verified" }, //default none
      { where: { id_user: id, role: 'tutor' } }
    );

    if (updated > 0) {
      res.status(200).json({ message: 'Tutor verified successfully' });
    } else {
      res.status(404).json({ message: 'Tutor not found' });
    }
  } catch (error) {
    console.error('Error verifying tutor:', error);
    res.status(500).json({ message: 'Error verifying tutor', error });
  }
};

export const getUnverifiedTutors = async (req: Request, res: Response) => {
  try {
    const unverifiedTutors = await User.findAll({
      where: {
        role: 'tutor',
        is_verified: 'none'
      },
      attributes: {
        exclude: ['password'] // Optional: sembunyikan kolom sensitif
      }
    });

    res.status(200).json(unverifiedTutors);
  } catch (error) {
    console.error('Error fetching unverified tutors:', error);
    res.status(500).json({ message: 'Error fetching unverified tutors', error });
  }
};


// GET 
export const getPendingTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      where: { status: 'pending' },
      include: ['user', 'course'],
      order: [['transaction_date', 'DESC']]
    });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Error fetching transactions', error });
  }
};


// Verifikasi status pembayaran transaksi
export const verifyPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [updated] = await Transaction.update(
      { status: 'paid' }, // default pending
      { where: { id_transaction: id } }
    );

    if (updated > 0) {
      res.status(200).json({ message: 'Payment status updated successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error });
  }
};

import { Op } from 'sequelize';
import dayjs from 'dayjs'; // install dulu: npm install dayjs

export const getMonthlyTransactionStats = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        status: 'success'
      },
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] }
        },
        {
          model: Course
        }
      ],
      order: [['transaction_date', 'ASC']]
    });

    // Kelompokkan transaksi berdasarkan bulan
    const grouped: Record<string, any> = {};

    transactions.forEach(tx => {
      const monthKey = dayjs(tx.transaction_date).startOf('month').format('YYYY-MM');

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: dayjs(tx.transaction_date).startOf('month').toDate(),
          total_amount: 0,
          transactions: []
        };
      }

      grouped[monthKey].total_amount += tx.amount;
      grouped[monthKey].transactions.push(tx);
    });

    // Konversi objek jadi array
    const result = Object.values(grouped);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching grouped transactions:', error);
    res.status(500).json({ message: 'Error fetching grouped transactions', error });
  }
};

