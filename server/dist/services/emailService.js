"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email configuration
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "edulearn20255@gmail.com",
        pass: "eker rbrk ehtg gtql",
    },
});
// Template generator functions
const getEmailTemplate = (type, data) => {
    const templates = {
        otp: generateOTPTemplate(data),
        payment_success: generatePaymentSuccessTemplate(data),
        payment_failed: generatePaymentFailedTemplate(data),
        payment_challenge: generatePaymentChallengeTemplate(data),
    };
    return templates[type];
};
const generateOTPTemplate = (data) => ({
    subject: "🔐 Kode Verifikasi EduPlus E-Learning",
    text: `
Kode Verifikasi Anda: ${data.otp}
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
    </style>
</head>
<body>
    <div class="header">
        <h1>EduPlus E-Learning</h1>
    </div>
    
    <div class="content">
        <p>Halo,</p>
        <p>Berikut adalah kode verifikasi Anda untuk mengakses sistem E-Learning EduPlus:</p>
        
        <div class="otp-code">${data.otp}</div>
        
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
});
const generatePaymentSuccessTemplate = (data) => ({
    subject: "🎉 Pembayaran Berhasil - EduPlus E-Learning",
    text: `
Halo ${data.name},

Pembayaran Anda untuk kursus "${data.courseName}" sebesar ${data.amount} telah berhasil diproses.

ID Transaksi: ${data.transactionId}

Anda sekarang dapat mengakses kursus tersebut di dashboard Anda.

Terima kasih telah memilih EduPlus E-Learning!
Tim EduPlus
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
            background-color: #27ae60;
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
        .highlight {
            font-weight: bold;
            color: #27ae60;
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
        <h1>Pembayaran Berhasil</h1>
    </div>
    
    <div class="content">
        <p>Halo ${data.name},</p>
        
        <p>Pembayaran Anda untuk kursus <span class="highlight">"${data.courseName}"</span> sebesar <span class="highlight">${data.amount}</span> telah berhasil diproses.</p>
        
        <p>ID Transaksi: <strong>${data.transactionId}</strong></p>
        
        <p>Anda sekarang dapat mengakses kursus tersebut di dashboard Anda.</p>
        
        <a href="https://eduplus.com/dashboard" class="button">Buka Dashboard</a>
        
        <p>Terima kasih telah memilih EduPlus E-Learning!</p>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} EduPlus E-Learning System. All rights reserved.</p>
        <p>Tim EduPlus E-Learning</p>
    </div>
</body>
</html>
  `,
});
const generatePaymentFailedTemplate = (data) => ({
    subject: "⚠️ Pembayaran Gagal - EduPlus E-Learning",
    text: `
Halo ${data.name},

Maaf, pembayaran Anda untuk kursus "${data.courseName}" sebesar ${data.amount} gagal diproses.

ID Transaksi: ${data.transactionId}

Silakan coba lagi atau hubungi tim dukungan kami jika masalah berlanjut.

Terima kasih,
Tim EduPlus
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
            background-color: #e74c3c;
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
        .highlight {
            font-weight: bold;
            color: #e74c3c;
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
        <h1>Pembayaran Gagal</h1>
    </div>
    
    <div class="content">
        <p>Halo ${data.name},</p>
        
        <p>Maaf, pembayaran Anda untuk kursus <span class="highlight">"${data.courseName}"</span> sebesar <span class="highlight">${data.amount}</span> gagal diproses.</p>
        
        <p>ID Transaksi: <strong>${data.transactionId}</strong></p>
        
        <p>Silakan coba lagi atau hubungi tim dukungan kami jika masalah berlanjut.</p>
        
        <a href="https://eduplus.com/payment/${data.transactionId}" class="button">Coba Lagi</a>
        
        <p>Terima kasih,</p>
        <p>Tim EduPlus</p>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} EduPlus E-Learning System. All rights reserved.</p>
    </div>
</body>
</html>
  `,
});
const generatePaymentChallengeTemplate = (data) => ({
    subject: "🔍 Verifikasi Pembayaran Diperlukan - EduPlus E-Learning",
    text: `
Halo ${data.name},

Pembayaran Anda untuk kursus "${data.courseName}" sebesar ${data.amount} memerlukan verifikasi tambahan.

ID Transaksi: ${data.transactionId}

Proses ini mungkin memakan waktu 1-2 hari kerja. Kami akan mengirimkan pemberitahuan begitu verifikasi selesai.

Terima kasih atas kesabaran Anda,
Tim EduPlus
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
            background-color: #f39c12;
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
        .highlight {
            font-weight: bold;
            color: #f39c12;
        }
        .footer {
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            background-color: #ecf0f1;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Verifikasi Pembayaran Diperlukan</h1>
    </div>
    
    <div class="content">
        <p>Halo ${data.name},</p>
        
        <p>Pembayaran Anda untuk kursus <span class="highlight">"${data.courseName}"</span> sebesar <span class="highlight">${data.amount}</span> memerlukan verifikasi tambahan.</p>
        
        <p>ID Transaksi: <strong>${data.transactionId}</strong></p>
        
        <p>Proses ini mungkin memakan waktu 1-2 hari kerja. Kami akan mengirimkan pemberitahuan begitu verifikasi selesai.</p>
        
        <p>Terima kasih atas kesabaran Anda,</p>
        <p>Tim EduPlus</p>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} EduPlus E-Learning System. All rights reserved.</p>
    </div>
</body>
</html>
  `,
});
const sendOTPEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, type, data } = options;
    const template = getEmailTemplate(type, data);
    const mailOptions = {
        from: '"EduPlus E-Learning" <edulearn20255@gmail.com>',
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            Importance: "High",
        },
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Email (${type}) sent to ${email}`); // Log untuk testing
    }
    catch (error) {
        console.error(`Error sending ${type} email:`, error);
        throw new Error(`Failed to send ${type} email`);
    }
});
exports.sendOTPEmail = sendOTPEmail;
