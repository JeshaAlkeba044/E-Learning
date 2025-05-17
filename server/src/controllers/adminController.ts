import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Course } from '../models/Course';
import { decrypt, encrypt } from '../utils/cryptoUtil';
import { Op } from 'sequelize';
import dayjs from 'dayjs'; 

export const getTutors = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    const tutors = users.filter(user => {
      const decryptedRole = decrypt(user.role);
      return decryptedRole === 'tutor';
    });

    res.status(200).json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors', error });
  }
};

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
    const users = await User.findAll({
      where: {
        is_verified: 'none'
      },
      attributes: {
        exclude: ['password'] 
      }
    });

    const unverifiedTutors = users.filter((user: any) => {
      const decryptedRole = decrypt(user.role);
      return decryptedRole === 'tutor';
    });

    if (unverifiedTutors.length === 0) {
      res.status(200).json({ message: 'Tidak ada tutor yang perlu diverifikasi', data: [] });
    }

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


export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Hitung total kursus aktif
    const totalCourses = await Course.count({
      where: { is_active: true },
    });

    // 2. Hitung total pengguna dengan role "learner"
    const allUsers = await User.findAll({
      attributes: ['role'], // ambil field yang dibutuhkan aja, biar hemat resource
    });

    const totalLearners = allUsers.filter(user => decrypt(user.role) === 'learner').length;

    // 3. Hitung total transaksi 'completed' bulan ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalTransactions = await Transaction.count({
      where: {
        transaction_date: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
        status: 'completed',
      },
    });

    // 4. Kirimkan data ringkasan dashboard
    res.json({
      success: true,
      data: {
        totalCourses,
        totalLearners,
        totalTransactions,
      },
    });

  } catch (error) {
    const err = error as Error;
    console.error('Error fetching dashboard summary:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};