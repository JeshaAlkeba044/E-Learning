import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { decrypt } from './cryptoUtil';

const JWT_SECRET = 'your-secret-key'; // Ganti dengan secret key yang kuat

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id_user, email: decrypt(user.encryptedEmail), role: decrypt(user.role) },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};