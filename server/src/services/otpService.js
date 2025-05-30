"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.generateOTP = void 0;
const otp_generator_1 = __importDefault(require("otp-generator"));
// Simpan OTP sementara di memory (untuk production, gunakan Redis/database)
const otpStorage = {};
const generateOTP = (email) => {
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    otpStorage[email] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // OTP berlaku 5 menit
    };
    return otp;
};
exports.generateOTP = generateOTP;
const verifyOTP = (email, otp) => {
    const storedOtp = otpStorage[email];
    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
        console.log('Gagal OTP', storedOtp, otp);
        return false;
    }
    delete otpStorage[email]; // Hapus OTP setelah digunakan
    return true;
};
exports.verifyOTP = verifyOTP;
