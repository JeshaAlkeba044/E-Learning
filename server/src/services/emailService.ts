import nodemailer from "nodemailer";

// Config untuk email testing (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edulearn20255@gmail.com",
    pass: "lzap ngus gbvv ujsn",
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"EduPlus E-Learning" if-23051@students.ithb.ac.id',
    to: email,
    subject: "🔐 Kode Verifikasi EduPlus E-Learning",
    text: `
Kode Verifikasi Anda: ${otp}
Berlaku selama 5 menit.

Jangan bagikan kode ini dengan siapapun.
Tim EduPlus E-Learning
  `,
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 3px;
        }
        .footer {
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            background-color: #ecf0f1;
            border-radius: 0 0 5px 5px;
        }
        .button {
            background-color: #3498db;
            color: white;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 3px;
            display: inline-block;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>EduPlus E-Learning</h1>
    </div>
    
    <div class="content">
        <p>Halo,</p>
        <p>Berikut adalah kode verifikasi Anda untuk mengakses sistem E-Learning EduPlus:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p>Kode ini akan <strong>kadaluarsa dalam 5 menit</strong>. Jangan berikan kode ini kepada siapapun.</p>
        
        <p>Jika Anda tidak meminta kode ini, silakan abaikan email ini atau hubungi tim dukungan kami.</p>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} EduPlus E-Learning System. All rights reserved.</p>
        <p>EduPlus E-Learning</p>
    </div>
</body>
</html>
  `,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "High",
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`); // Log untuk testing
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
