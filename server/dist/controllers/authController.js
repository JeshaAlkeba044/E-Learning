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
exports.updateProfile = exports.getProfile = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwtUtils_1 = require("../utils/jwtUtils");
const otpService_1 = require("../services/otpService");
const emailService_1 = require("../services/emailService");
const cryptoUtil_1 = require("../utils/cryptoUtil");
const authMiddleware_1 = require("../middleware/authMiddleware");
// Register dengan OTP
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, role, specialization, experience, bio, portofolio } = req.body;
    console.log('Request body:', req.body); // debug
    // Encrypt data
    const emailHashed = (0, cryptoUtil_1.hashEmail)(email);
    const encryptEmail = (0, cryptoUtil_1.encrypt)(email);
    const firstNameEncrypted = (0, cryptoUtil_1.encrypt)(firstName);
    const lastNameEncrypted = (0, cryptoUtil_1.encrypt)(lastName);
    const roleEncrypted = (0, cryptoUtil_1.encrypt)(role);
    const specializationEncrypted = specialization !== undefined ? (0, cryptoUtil_1.encrypt)(specialization) : null;
    const experienceEncrypted = experience !== undefined ? (0, cryptoUtil_1.encrypt)(experience) : null;
    const bioEncrypted = bio !== undefined ? (0, cryptoUtil_1.encrypt)(bio) : null;
    const portofolioEncrypted = portofolio !== undefined ? (0, cryptoUtil_1.encrypt)(portofolio) : null;
    try {
        // Cek apakah email sudah terdaftar
        const existingUser = yield User_1.User.findOne({ where: { hashEmail: emailHashed } });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // bcrypt password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.User.create({
            firstName: firstNameEncrypted,
            lastName: lastNameEncrypted,
            hashEmail: emailHashed,
            encryptedEmail: encryptEmail,
            password: hashedPassword,
            specialization: specializationEncrypted,
            YoE: experienceEncrypted,
            bio: bioEncrypted,
            portofolio: portofolioEncrypted,
            role: roleEncrypted,
        });
        // Generate dan kirim OTP
        const otp = (0, otpService_1.generateOTP)(emailHashed);
        yield (0, emailService_1.sendOTPEmail)({
            email,
            type: 'otp',
            data: { otp: otp }
        });
        res.status(201).json({
            message: 'Registration successful. Please check your email for OTP.',
            userId: user.id_user,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error during registration', error });
        console.error('Registration error:', error);
    }
});
exports.register = register;
// Verifikasi OTP setelah register
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const hashedEmail = (0, cryptoUtil_1.hashEmail)(email);
    try {
        // Verifikasi OTP
        if (!(0, otpService_1.verifyOTP)(hashedEmail, otp)) {
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying email', error });
    }
});
exports.verifyEmail = verifyEmail;
// Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const hashedEmail = (0, cryptoUtil_1.hashEmail)(email);
    console.log("\n\n\n\nencrypted email", (0, cryptoUtil_1.encrypt)("admin1@example.com"));
    console.log("\n\n\n\ndec email", (0, cryptoUtil_1.decrypt)("d8c38ef3a50d6904f9982ac7c94ff620:8bcf6490f69104a66826b188b8fe42e6fab3b91e392c0470d6968714b5962abc"));
    console.log("email", email);
    console.log("hashemail", hashedEmail);
    try {
        // Cek user
        const user = yield User_1.User.findOne({ where: { hashEmail: hashedEmail } });
        if (!user) {
            res.status(401).json({ message: 'Invalid email' });
            return;
        }
        // Cek password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        // Cek apakah email sudah diverifikasi untuk tutor
        if (user.role === 'tutor' && user.statusUser !== 'verified') {
            res.status(403).json({ message: 'Email not verified. Please check your email for OTP.' });
            return;
        }
        // Generate token
        const token = (0, jwtUtils_1.generateToken)(user);
        console.log("ID user: ", user.id_user, "\nFirst Name: ", (0, cryptoUtil_1.decrypt)(user.firstName), "\nLast Name: ", (0, cryptoUtil_1.decrypt)(user.lastName), "\nEmail: ", (0, cryptoUtil_1.decrypt)(user.encryptedEmail), "\nSpecialization: ", user.specialization !== null ? (0, cryptoUtil_1.decrypt)(user.specialization) : null, "\nRole: ", user.role, "\nToken: ", token); // di database perlu membuat 2 kolom yaitu hashed_email dan encrypt_email
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id_user,
                firstName: (0, cryptoUtil_1.decrypt)(user.firstName),
                lastName: (0, cryptoUtil_1.decrypt)(user.lastName),
                email: (0, cryptoUtil_1.decrypt)(user.encryptedEmail),
                role: (0, cryptoUtil_1.decrypt)(user.role),
                specialization: user.specialization !== null ? (0, cryptoUtil_1.decrypt)(user.specialization) : null,
                YoE: user.YoE !== null ? (0, cryptoUtil_1.decrypt)(user.YoE) : null,
                bio: user.bio !== null ? (0, cryptoUtil_1.decrypt)(user.bio) : null,
                portofolio: user.linkPorto !== null ? (0, cryptoUtil_1.decrypt)(user.linkPorto) : null,
                photo_path: user.photo_path || 'defaulPic.png',
            },
        });
    }
    catch (error) {
        console.error('Login error:', error); // debug
        res.status(500).json({ message: 'Error during login', error });
    }
});
exports.login = login;
// Forgot Password (Kirim OTP)
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const hashedEmail = (0, cryptoUtil_1.hashEmail)(email);
    try {
        // Cek user
        const user = yield User_1.User.findOne({ where: { hashEmail: hashedEmail } });
        if (!user) {
            res.status(404).json({ message: 'Email not found' });
            return;
        }
        // Generate dan kirim OTP
        const otp = (0, otpService_1.generateOTP)(hashedEmail);
        yield (0, emailService_1.sendOTPEmail)({
            email,
            type: 'otp',
            data: { otp: otp }
        });
        res.status(200).json({ message: 'OTP sent to email' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error });
    }
});
exports.forgotPassword = forgotPassword;
// Reset Password dengan OTP
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    const hashedEmail = (0, cryptoUtil_1.hashEmail)(email);
    try {
        // Validasi password baru
        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters' });
            return;
        }
        // Update password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield User_1.User.update({ password: hashedPassword }, { where: { hashEmail: hashedEmail } });
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
});
exports.resetPassword = resetPassword;
// Routes for profile
exports.getProfile = [authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            res.status(200).json({
                user: {
                    id: user.id_user,
                    firstName: (0, cryptoUtil_1.decrypt)(user.firstName),
                    lastName: (0, cryptoUtil_1.decrypt)(user.lastName),
                    email: (0, cryptoUtil_1.decrypt)(user.encryptedEmail),
                    role: (0, cryptoUtil_1.decrypt)(user.role),
                    specialization: user.specialization ? (0, cryptoUtil_1.decrypt)(user.specialization) : null,
                    YoE: user.YoE ? (0, cryptoUtil_1.decrypt)(user.YoE) : null,
                    bio: user.bio ? (0, cryptoUtil_1.decrypt)(user.bio) : null,
                    portofolio: user.linkPorto ? (0, cryptoUtil_1.decrypt)(user.linkPorto) : null,
                    photo_path: user.photo_path || null,
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error });
        }
    })
];
exports.updateProfile = [
    authMiddleware_1.authenticate,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { firstName, lastName, bio, portofolio } = req.body;
            // Handle profile photo separately if it's being updated
            const profilePhoto = req.body.profilePhoto;
            yield user.update({
                firstName: firstName ? (0, cryptoUtil_1.encrypt)(firstName) : user.firstName,
                lastName: lastName ? (0, cryptoUtil_1.encrypt)(lastName) : user.lastName,
                bio: bio ? (0, cryptoUtil_1.encrypt)(bio) : user.bio,
                portofolio: portofolio ? (0, cryptoUtil_1.encrypt)(portofolio) : user.linkPorto,
                photo_path: profilePhoto || user.photo_path
            });
            res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id_user,
                    firstName: (0, cryptoUtil_1.decrypt)(user.firstName),
                    lastName: (0, cryptoUtil_1.decrypt)(user.lastName),
                    email: (0, cryptoUtil_1.decrypt)(user.encryptedEmail),
                    bio: user.bio ? (0, cryptoUtil_1.decrypt)(user.bio) : null,
                    portofolio: user.linkPorto ? (0, cryptoUtil_1.decrypt)(user.linkPorto) : null,
                    photo_path: user.photo_path || null
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error updating profile', error });
        }
    })
];
