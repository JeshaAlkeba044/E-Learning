import { Request, Response } from 'express';
import { Transaction, Course, User } from '../models';
import { Sequelize, Op } from 'sequelize';
import { snap } from '../utils/midtrans';
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '../utils/cryptoUtil';
import { sendOTPEmail } from '../services/emailService';

type EmailType = "otp" | "payment_success" | "payment_failed" | "payment_challenge";

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
    const userId = req.user?.id_user;
    
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
      where: { 
        id_user: userId, 
        id_course: id, 
        status: ['completed', 'pending'] 
      }
    });
    
    if (existingTransaction) {
      res.status(400).json({ 
        success: false,
        message: 'You already have a transaction for this course' 
      });
      return 
    }
    
    // Calculate final amount
    let finalAmount = parseFloat(amount);
    if (voucher === 'DISKON10') {
      finalAmount = finalAmount * 0.9;
    } else if (voucher === 'DISKON20') {
      finalAmount = finalAmount * 0.8;
    }

    // Generate transaction ID
    const orderId = `EDU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create transaction in database first
    const newTransaction = await Transaction.create({
      id_transaction: orderId,
      id_user: userId,
      id_course: id,
      amount: finalAmount,
      payment_method: 'midtrans', // Will be updated from Midtrans response
      status: 'pending',
      transaction_date: new Date()
    });

    // Prepare Midtrans parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: finalAmount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: decrypt(req.user?.firstName || ""),
        last_name: decrypt(req.user?.lastName || ""),
        email: decrypt(req.user?.encryptedEmail || ""),
        phone: decrypt(req.user?.phone_number || "")
      },
      callbacks: {
        finish: `http://localhost:5502/client/courses/course_detail.html?id=${id}#payment-complete`,
        error: `http://localhost:5502/client/courses/course_detail.html?id=${id}`,
        pending: `http://localhost:5502/client/courses/course_detail.html?id=${id}`
      }
    };

    // Create Midtrans transaction
    const midtransTransaction = await snap.createTransaction(parameter);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction: {
          id: orderId,
          amount: finalAmount,
          status: 'pending'
        },
        payment_token: midtransTransaction.token,
        redirect_url: midtransTransaction.redirect_url
      }
    });
    return 

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return 
  }
};




export const paymentNotification = async (req: Request, res: Response) => {
  try {
    const notificationJson = req.body;
    
    // Verify notification with Midtrans
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(`Transaction notification. Order ID: ${orderId}. Status: ${transactionStatus}`);

    // Find transaction in database
    const transaction = await Transaction.findByPk(orderId, {
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
      console.error(`Transaction ${orderId} not found in database`);
      res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
      return 
    }

    // Determine status and email type
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

    // Send email notification if needed
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

    res.status(200).send('OK');
    return 

  } catch (error) {
    console.error('Error handling payment notification:', error);
    res.status(500).send('Error processing notification');
    return 
  }
};



export const checkTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    // Check in database first
    const transaction = await Transaction.findByPk(orderId);
    
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return 
    }
    
    // If already completed in our database, return that
    if (transaction.status === 'completed') {
      res.json({
        success: true,
        data: {
          status: 'completed',
          transaction
        }
      });
      return 
    }
    
    // Otherwise check with Midtrans
    const statusResponse = await snap.transaction.status(orderId);
    
    // Update our database based on Midtrans status
    if (statusResponse.transaction_status === 'settlement' || 
        statusResponse.transaction_status === 'capture') {
      await Transaction.update(
        { status: 'completed' },
        { where: { id_transaction: orderId } }
      );
    }
    
    res.json({
      success: true,
      data: {
        status: statusResponse.transaction_status,
        transaction: {
          ...transaction.toJSON(),
          status: statusResponse.transaction_status === 'settlement' || 
                  statusResponse.transaction_status === 'capture' ? 
                  'completed' : transaction.status
        }
      }
    });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking transaction status'
    });
  }
};


export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;
    const { courseId } = req.query;

    console.log("\n\n\n\n\n\nid", courseId);
    
    const whereClause: any = { id_user: userId };
    if (courseId) {
      whereClause.id_course = courseId;
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
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return 
    }

    // Check with Midtrans for latest status
    const statusResponse = await snap.transaction.status(transactionId);
    
    const transactionStatus = statusResponse.transaction_status;
    const paymentType = statusResponse.payment_type;
    
    let status = transaction.status;
    let emailType:EmailType = 'otp';

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      status = 'completed';
      emailType = 'payment_success';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      status = 'failed';
      emailType = 'payment_failed';
    }

    // Update transaction with payment method from Midtrans
    transaction.status = status;
    if (paymentType) {
      transaction.payment_method = paymentType;
    }
    await transaction.save();

    // Send email notification if status changed
    if (emailType && transaction.user) {
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
      message: 'Transaction verified successfully',
      data: {
        status: transaction.status,
        payment_method: transaction.payment_method
      }
    });

  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ success: false, message: 'Error verifying transaction', error });
  }
};