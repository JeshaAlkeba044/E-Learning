import nodemailer from 'nodemailer';

// Config untuk email testing (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'richiewidjaya276@gmail.com', // Ganti dengan email testing Anda
    pass: 'xxxx', // Gunakan App Password dari Google Account
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: 'richiewidjaya276@gmail.com',
    to: email,
    subject: 'OTP for E-Learning Verification',
    text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`); // Log untuk testing
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};