import { Request, Response } from 'express';
import { Transaction, Course } from '../models';
import { Sequelize, Op } from 'sequelize';

export const getStatistik = async (req: Request, res: Response) => {
  const { year, month } = req.query;

  const parsedYear = parseInt(year as string);
  const parsedMonth = parseInt(month as string);

  const whereClause: any = {};
  if (!isNaN(parsedYear)) {
    whereClause[Op.and] = [
      Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('created_at')), parsedYear),
    ];
    if (month && !isNaN(parsedMonth)) {
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

    // Kelompokkan transaksi per bulan
    const grouped = transactions.reduce((acc: any, t: any) => {
      const date = new Date(t.created_at);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const key = `${m}-${y}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});

    // Buat data untuk tabel
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

    // Bulan terbaik berdasarkan total revenue
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
    console.error("💥 Error getStatistik:", error);
    res.status(500).json({ message: "Server error" });
  }
};

function getMonthName(month: number) {
  return [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ][month - 1] || '';
}

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { id, paymentMethod, amount, voucher } = req.body;
    const userId = req.user?.id_user; // From auth middleware
    
    console.log("fdsfsfs", req.body);

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
