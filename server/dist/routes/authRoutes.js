"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authMiddleware_1.validateRegister, authController_1.register);
router.post('/verify-email', authController_1.verifyEmail);
router.post('/login', authMiddleware_1.validateLogin, authController_1.login);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password', authController_1.resetPassword);
// Protected routes
router.get('/profile', authMiddleware_1.authenticate, authController_1.getProfile);
router.put('/profile', authMiddleware_1.authenticate, authController_1.updateProfile);
exports.default = router;
