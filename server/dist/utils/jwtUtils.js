"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cryptoUtil_1 = require("./cryptoUtil");
const JWT_SECRET = 'your-secret-key'; // Ganti dengan secret key yang kuat
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id_user, email: (0, cryptoUtil_1.decrypt)(user.encryptedEmail), role: (0, cryptoUtil_1.decrypt)(user.role) }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
