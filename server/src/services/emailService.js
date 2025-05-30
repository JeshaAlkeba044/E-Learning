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
// Config untuk email testing (Gmail SMTP)
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'richiewidjaya276@gmail.com', // Ganti dengan email testing Anda
        pass: 'xxxx', // Gunakan App Password dari Google Account
    },
});
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // const mailOptions = {
    //   from: 'richiewidjaya276@gmail.com',
    //   to: email,
    //   subject: 'OTP for E-Learning Verification',
    //   text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
    // };
    try {
        // await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`); // Log untuk testing
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
});
exports.sendOTPEmail = sendOTPEmail;
