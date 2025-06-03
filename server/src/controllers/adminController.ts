import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Course } from '../models/Course';
import { decrypt, encrypt, hashEmail } from '../utils/cryptoUtil';
import { Op } from 'sequelize';
import dayjs from 'dayjs'; 
import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../services/emailService';
import { snap } from '../utils/midtrans';

type EmailType = "otp" | "payment_success" | "payment_failed" | "payment_challenge";


export const addAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone_number } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "Data tidak lengkap" });
    }

    const encryptedEmail = encrypt(email);
    const hashedEmail = hashEmail(email);

    const existing = await User.findOne({ where: { encryptedEmail } });
    if (existing) {
      res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      firstName: encrypt(firstName),
      lastName: encrypt(lastName),
      hashEmail: hashedEmail,
      encryptedEmail,
      password: hashPassword,
      phone_number: encrypt(phone_number),
      role: encrypt("admin"),
      statusUser: "verified",
    });

    res.status(201).json({
      message: "Admin berhasil ditambahkan",
      admin: {
        id: newAdmin.id,
        email,
        firstName,
        lastName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan admin" });
  }
};





export const getTutors = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    const tutors: any[] = [];

    for (const user of users) {
      const decryptedRole = user.role;
      console.log("\n\n\nUSER ADMIN: ", user)

      if (decryptedRole === 'tutor') {
        const decryptedEmail = decrypt(user.encryptedEmail);
        const decryptedFirstName = user.firstName;
        const decryptedLastName = user.lastName;
        const decryptedSpecialization = user.specialization;
        const decryptedExperience = user.YoE;
        const decryptedBio = user.bio;
        // const decryptedPortofolio = await decrypt(user.linkPorto);

        const tutorData = {
          ...user.toJSON(),
          email: decryptedEmail,
          firstName: decryptedFirstName,
          lastName: decryptedLastName,
          specialization: decryptedSpecialization,
          phone_number: user.phone_number,
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
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          attributes: ['id_user', 'firstName', 'lastName', 'encryptedEmail']
        },
        {
          model: Course,
          attributes: ['id_course', 'title']
        }
      ]
    });

    if (!transaction) {
      res.status(404).json({ 
        success: false, 
        message: 'Transaction not found in database' 
      });
      return 
    }

    // Skip Midtrans check if already completed in our database
    if (transaction.status === 'completed') {
      res.json({ 
        success: true, 
        message: 'Transaction already completed',
        data: transaction
      });
      return 
    }

    // Check with Midtrans only for pending transactions
    let statusResponse;
    try {
      statusResponse = await snap.transaction.status(transactionId);
    } catch (midtransError:any) {
      // If Midtrans returns 404, check if we have enough data locally
      if (midtransError.httpStatusCode === '404') {
        // For demo purposes, we'll mark as completed if amount > 0
        if (transaction.amount > 0) {
          transaction.status = 'completed';
          await transaction.save();
          
          // Send success email
          if (transaction.user) {
            const email = decrypt(transaction.user.encryptedEmail);
            const firstName = decrypt(transaction.user.firstName);
            
            await sendOTPEmail({
              email,
              type: 'payment_success',
              data: {
                name: firstName,
                courseName: transaction.course?.title || 'the course',
                amount: transaction.amount,
                transactionId: transaction.id_transaction
              }
            });
          }
          
          res.json({ 
            success: true, 
            message: 'Transaction marked as completed (Midtrans not found)',
            data: transaction
          });
          return 
        }
      }
      
      console.error('Midtrans error:', midtransError);
      res.status(500).json({ 
        success: false, 
        message: 'Error verifying with Midtrans',
        error: midtransError.message 
      });
      return 
    }

    const transactionStatus = statusResponse.transaction_status;
    const paymentType = statusResponse.payment_type;
    const fraudStatus = statusResponse.fraud_status;
    
    let status = transaction.status;
    let emailType: EmailType = 'otp';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        status = 'challenge';
        emailType = 'payment_challenge';
      } else if (fraudStatus === 'accept') {
        status = 'completed';
        emailType = 'payment_success';
      }
    } else if (transactionStatus === 'settlement') {
      status = 'completed';
      emailType = 'payment_success';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      status = 'failed';
      emailType = 'payment_failed';
    }

    // Update transaction
    transaction.status = status;
    if (paymentType) {
      transaction.payment_method = paymentType;
    }
    await transaction.save();

    // Send email notification if status changed
    if (emailType !== 'otp' && transaction.user) {
      const email = decrypt(transaction.user.encryptedEmail);
      const firstName = decrypt(transaction.user.firstName);
      
      await sendOTPEmail({
        email,
        type: emailType,
        data: {
          name: firstName,
          courseName: transaction.course?.title || 'the course',
          amount: transaction.amount,
          transactionId: transaction.id_transaction
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Transaction status updated',
      data: {
        id: transaction.id_transaction,
        status: transaction.status,
        payment_method: transaction.payment_method,
        amount: transaction.amount,
        course: transaction.course?.title
      }
    });
    return 

  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return 
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

    const totalLearners = allUsers.filter(user => user.role === 'learner').length;
    
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

  if (yearParam && yearParam !== 'al  l' && !isNaN(parseInt(yearParam))) {
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
      // Jika tidak ada transaksi, tetap kirimkan 12 bulan kosong
      const currentYear = parseInt(yearParam) || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => `${getMonthName(i + 1)} ${currentYear}`);
      res.json({
        summary: {
          totalTransactions: 0,
          totalRevenue: 0,
          avgMonthly: 0,
          bestMonth: "-",
        },
        table: months.map(month => ({
          monthName: month,
          transactionCount: 0,
          totalRevenue: 0,
          avgPerTransaction: 0,
        })),
        chart: {
          months,
          revenue: Array(12).fill(0),
          transactions: Array(12).fill(0),
        }
      });
    }

    const summary = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((acc, t: any) => acc + (t.amount || 0), 0),
      avgMonthly: 0,
      bestMonth: '',
    };

    // Group transaksi per bulan
    const grouped = transactions.reduce((acc: any, t: any) => {
      const date = new Date(t.created_at);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const key = `${m}-${y}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});

    // Bangun data bulanan untuk 12 bulan
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const yearForStats = parseInt(yearParam) || new Date().getFullYear();

    const monthMap: Record<string, {
      monthName: string,
      transactionCount: number,
      totalRevenue: number,
      avgPerTransaction: number
    }> = {};

    for (const m of allMonths) {
      const key = `${m}-${yearForStats}`;
      const txs = grouped[key] || [];

      const revenue = txs.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const avg = txs.length ? revenue / txs.length : 0;

      monthMap[key] = {
        monthName: `${getMonthName(m)} ${yearForStats}`,
        transactionCount: txs.length,
        totalRevenue: revenue,
        avgPerTransaction: Math.round(avg),
      };
    }

    const table = allMonths.map(m => {
      const key = `${m}-${yearForStats}`;
      return monthMap[key];
    });

    const monthsWithData = table.filter(row => row.transactionCount > 0);
    if (monthsWithData.length > 0) {
      const sortedByRevenue = [...monthsWithData].sort((a, b) => b.totalRevenue - a.totalRevenue);
      summary.bestMonth = sortedByRevenue[0].monthName;
      summary.avgMonthly = Math.round(summary.totalRevenue / monthsWithData.length);
    } else {
      summary.bestMonth = "-";
      summary.avgMonthly = 0;
    }

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
          firstName: decrypt(learner.firstName),
          lastName: decrypt(learner.lastName),
          role: learner.role,
        },
        course: {
          id_course: course?.id_course,
          title: course?.title,
          instructor: instructor
            ? {
                id_user: instructor.id_user,
                firstName: decrypt(instructor.firstName),
                lastName: decrypt(instructor.lastName),
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