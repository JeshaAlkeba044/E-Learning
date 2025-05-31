import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Course } from '../models/Course';
import { decrypt, encrypt } from '../utils/cryptoUtil';
import { Op } from 'sequelize';
import dayjs from 'dayjs'; 
import Sequelize from 'sequelize';

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


const getMonthName = (month: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1];
};

export const getStatistik = async (req: Request, res: Response) => {
  const { year, month } = req.query;

  console.log('Headers:', req.headers); // Log headers yang diterima
  console.log('Query:', req.query); // Log parameter query
  

  const yearParam = year as string;
  const monthParam = month as string;

  const whereClause: any = {};

  if (yearParam && yearParam !== 'all' && !isNaN(parseInt(yearParam))) {
    const parsedYear = parseInt(yearParam);
    whereClause[Op.and] = [
      Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('created_at')), parsedYear)
    ];

    if (monthParam && monthParam !== 'all' && !isNaN(parseInt(monthParam))) {
      const parsedMonth = parseInt(monthParam);
      whereClause[Op.and].push(
        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('created_at')), parsedMonth)
      );
    }
  }

  try {
    const transactions = await Transaction.findAll({ where: whereClause });

    if (!transactions.length) {
      res.json({
        summary: {
          totalTransactions: 0,
          totalRevenue: 0,
          avgMonthly: 0,
          bestMonth: "-",
        },
        table: [],
        chart: {
          months: [],
          revenue: [],
          transactions: [],
        }
      });
    }

    const summary = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((acc, t: any) => acc + (t.amount || 0), 0),
      avgMonthly: 0,
      bestMonth: '',
    };

    const grouped = transactions.reduce((acc: any, t: any) => {
      const date = new Date(t.created_at);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const key = `${m}-${y}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});

    const table = Object.entries(grouped).map(([key, txs]) => {
      const [m, y] = key.split("-");
      const transactionsArray = txs as any[];
      const revenue = transactionsArray.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const avg = revenue / transactionsArray.length;

      return {
        monthName: `${getMonthName(+m)} ${y}`,
        transactionCount: transactionsArray.length,
        totalRevenue: revenue,
        avgPerTransaction: Math.round(avg),
      };
    });

    const sortedByRevenue = [...table].sort((a, b) => b.totalRevenue - a.totalRevenue);
    summary.bestMonth = sortedByRevenue[0].monthName;
    summary.avgMonthly = Math.round(summary.totalRevenue / Object.keys(grouped).length);

    const chart = {
      months: table.map(row => row.monthName),
      revenue: table.map(row => row.totalRevenue),
      transactions: table.map(row => row.transactionCount),
    };

    res.json({ summary, table, chart });

  } catch (error) {
    console.error("Error getStatistik:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAll = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          where: { role: 'learner' }, // kalau kamu mau filter user learner aja
          attributes: ['id_user', 'firstName', 'lastName', 'role'],
        },
        {
          model: Course,
          attributes: ['id_course', 'title'],
          include: [
            {
              model: User,
              as: 'instructor_Id', // sesuai alias di model Course
              attributes: ['id_user', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['transaction_date', 'DESC']],
    });

    // Fungsi enkripsi base64 biar aman tampilannya
    const encrypt = (text: string) => Buffer.from(text).toString('base64');

    // Mapping data dan encrypt nama learner & instructor
    const result = transactions.map((trx) => {
      const learner = trx.user;
      const course = trx.course;
      const instructor = course?.instructor_Id;

      return {
        id_transaction: trx.id_transaction,
        transaction_date: trx.transaction_date,
        amount: trx.amount,
        payment_method: trx.payment_method,
        status: trx.status,
        created_at: trx.created_at,
        updated_at: trx.updated_at,
        learner: {
          id_user: learner.id_user,
          firstName: encrypt(learner.firstName),
          lastName: encrypt(learner.lastName),
          role: learner.role,
        },
        course: {
          id_course: course?.id_course,
          title: course?.title,
          instructor: instructor
            ? {
                id_user: instructor.id_user,
                firstName: encrypt(instructor.firstName),
                lastName: encrypt(instructor.lastName),
              }
            : null,
        },
      };
    });

    res.json(result);
  } catch (error) {
    console.error('🔥 Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};