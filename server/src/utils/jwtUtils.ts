import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = 'your-secret-key'; // Ganti dengan secret key yang kuat

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id_user, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};