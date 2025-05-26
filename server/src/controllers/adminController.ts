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

    const tutors: any[] = [];

    for (const user of users) {
      const decryptedRole = await decrypt(user.role);
      if (decryptedRole === 'tutor') {
        const decryptedEmail = await decrypt(user.encryptedEmail);
        const decryptedFirstName = await decrypt(user.firstName);
        const decryptedLastName = await decrypt(user.lastName);
        const decryptedSpecialization = await decrypt(user.specialization);
        const decryptedExperience = await decrypt(user.YoE);
        const decryptedBio = await decrypt(user.bio);
        // const decryptedPortofolio = await decrypt(user.linkPorto);

        const tutorData = {
          ...user.toJSON(),
          email: decryptedEmail,
          firstName: decryptedFirstName,
          lastName: decryptedLastName,
          specialization: decryptedSpecialization,
          YoE: decryptedExperience,
          bio: decryptedBio,          
        };

        tutors.push(tutorData);
      }
    }

    res.status(200).json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors', error });
  }
};


export const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {

    const deletedUser = await User.destroy({ where: { id_user: id }});

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

export const verifyTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ where: { id_user: id } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    const decryptedRole = await decrypt(user.role);

    if (decryptedRole !== 'tutor') {
      res.status(403).json({ message: 'User is not a tutor' });
    }

    await User.update(
      { statusUser: 'verified' },
      { where: { id_user: id } }
    );

    res.status(200).json({ message: 'Tutor verified successfully' });

  } catch (error) {
    console.error('Error verifying tutor:', error);
    res.status(500).json({ message: 'Error verifying tutor', error });
  }
};


export const getUnverifiedTutors = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: {
        statusUser: 'none'
      },
      attributes: {
        exclude: ['password'] 
      }
    });

    const unverifiedTutors = users.filter((user: any) => {
      user.firstName = decrypt(user.firstName);
      user.lastName = decrypt(user.lastName);
      const decryptedRole = decrypt(user.role);
      return decryptedRole === 'tutor';
    });


    res.status(200).json({
      message: unverifiedTutors.length === 0 ? 'Tidak ada tutor yang perlu diverifikasi' : undefined,
      data: unverifiedTutors
    });
  } catch (error) {
    console.error('Error fetching unverified tutors:', error);
    res.status(500).json({ message: 'Error fetching unverified tutors', error });
  }
};



export const getPendingTransactions = async (req: Request, res: Response) => {
  try {
    const pendingTransactions = await Transaction.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Course,
          attributes: ['title']
        }
      ],
      order: [['transaction_date', 'DESC']]
    });

    const formattedTransactions = await Promise.all(
      pendingTransactions.map(async (trx) => {
        const decryptedFirstName = await decrypt(trx.user?.firstName || '');
        const decryptedLastName = await decrypt(trx.user?.lastName || '');

        return {
          id_transaction: trx.id_transaction,
          transaction_date: trx.transaction_date,
          amount: trx.amount,
          payment_method: trx.payment_method,
          status: trx.status,
          user: {
            name: `${decryptedFirstName} ${decryptedLastName}`.trim()
          },
          course: {
            title: trx.course?.title || '-'
          }
        };
      })
    );

    res.json({ success: true, data: formattedTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data transaksi' });
  }
};

// Verifikasi status pembayaran transaksi
export const verifyPayment = async (req: Request, res: Response) => {
  const transactionId = req.params.id;

  try {
    const transaction = await Transaction.findByPk(transactionId);

    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
      return;
    }

    transaction.status = 'completed';
    await transaction.save();

    res.json({ success: true, message: 'Transaksi berhasil diverifikasi' });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memverifikasi transaksi' });
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
    const totalCourses = await Course.count({
      where: { is_active: true },
    });

    const allUsers = await User.findAll({
      attributes: ['role']
    });

    const totalLearners = allUsers.filter(user => decrypt(user.role) === 'learner').length;

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