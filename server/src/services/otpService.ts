import otpGenerator from 'otp-generator';
import { User } from '../models/User';

// Simpan OTP sementara di memory (untuk production, gunakan Redis/database)
const otpStorage: Record<string, { otp: string; expiresAt: number }> = {};

export const generateOTP = (email: string): string => {
  const otp = otpGenerator.generate(6, {
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

export const verifyOTP = (email: string, otp: string): boolean => {
  const storedOtp = otpStorage[email];
  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return false;
  }
  delete otpStorage[email]; // Hapus OTP setelah digunakan
  return true;
};