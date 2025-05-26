import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { generateOTP, verifyOTP } from '../services/otpService';
import { sendOTPEmail } from '../services/emailService';
import { decrypt, encrypt, hashEmail } from '../utils/cryptoUtil';
import { authenticate, authorize } from '../middleware/authMiddleware';

// Register dengan OTP
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role, specialization, experience, bio, portofolio } = req.body;
  
  console.log('Request body:', req.body); // debug
  // Encrypt data
  const emailHashed = hashEmail(email);
  const encryptEmail = encrypt(email);

  const firstNameEncrypted = encrypt(firstName);
  const lastNameEncrypted = encrypt(lastName);
  const roleEncrypted = encrypt(role);
  const specializationEncrypted = specialization !== undefined? encrypt(specialization) : null;
  const experienceEncrypted = experience !== undefined? encrypt(experience) : null;
  const bioEncrypted = bio !== undefined? encrypt(bio) : null;
  const portofolioEncrypted = portofolio !== undefined? encrypt(portofolio) : null;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { hashEmail: emailHashed } });
    if (existingUser) {
        res.status(400).json({ message: 'Email already registered' });
        return;
    }

    // bcrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
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
    const otp = generateOTP(emailHashed);
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP.',
      userId: user.id_user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during registration', error });
    console.error('Registration error:', error);
  }
};

// Verifikasi OTP setelah register
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const hashedEmail = hashEmail(email);

  try {
    // Verifikasi OTP
    if (!verifyOTP(hashedEmail, otp)) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return 
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedEmail = hashEmail(email);

  try {
    // Cek user
    
    const user = await User.findOne({ where: { hashEmail : hashedEmail } });
    if (!user) {
        res.status(401).json({ message: 'Invalid email' });
        return 
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid password' });
        return 
    }

    // Cek apakah email sudah diverifikasi untuk tutor
    if (user.role === 'tutor' && user.statusUser !== 'verified') {
        res.status(403).json({ message: 'Email not verified. Please check your email for OTP.' });
        return 
    }

    // Generate token
    const token = generateToken(user);

    console.log("ID user: ", user.id_user,
      "\nFirst Name: ", decrypt(user.firstName),
      "\nLast Name: ", decrypt(user.lastName),
      "\nEmail: ", decrypt(user.encryptedEmail),
      "\nSpecialization: ", user.specialization !== null ? decrypt(user.specialization) : null,
      "\nRole: ", user.role,
      "\nToken: ", token
    ); // di database perlu membuat 2 kolom yaitu hashed_email dan encrypt_email


    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id_user,
        firstName: decrypt(user.firstName),
        lastName: decrypt(user.lastName),
        email: decrypt(user.encryptedEmail),
        role: decrypt(user.role),
        specialization: user.specialization !== null? decrypt(user.specialization) : null,
        YoE: user.YoE !== null ? decrypt(user.YoE) : null,
        bio: user.bio !== null ? decrypt(user.bio) : null,
        portofolio: user.linkPorto !== null ? decrypt(user.linkPorto) : null,
        photo_path: user.photo_path || '../uploads/defaulPic.png',
      },
    });
  } catch (error) {
    console.error('Login error:', error); // debug
    res.status(500).json({ message: 'Error during login', error });
  }
};

// Forgot Password (Kirim OTP)
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const hashedEmail = hashEmail(email);

  try {
    // Cek user
    const user = await User.findOne({ where: { hashEmail:hashedEmail } });
    if (!user) {
        res.status(404).json({ message: 'Email not found' });
        return 
    }

    // Generate dan kirim OTP
    const otp = generateOTP(hashedEmail);
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

// Reset Password dengan OTP
export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  const hashedEmail = hashEmail(email);

  try {
    // Validasi password baru
    if (newPassword.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters' });
        return 
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { hashEmail: hashedEmail } });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};


declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Routes for profile
export const getProfile = [ authenticate, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      res.status(200).json({
        user: {
          id: user.id_user,
          firstName: decrypt(user.firstName),
          lastName: decrypt(user.lastName),
          email: decrypt(user.encryptedEmail),
          role: decrypt(user.role),
          specialization: user.specialization ? decrypt(user.specialization) : null,
          YoE: user.YoE ? decrypt(user.YoE) : null,
          bio: user.bio ? decrypt(user.bio) : null,
          portofolio: user.linkPorto ? decrypt(user.linkPorto) : null,
          photo_path: user.photo_path || null,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile', error });
    }
  }
];

export const updateProfile = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const { firstName, lastName, specialization, experience, bio, portofolio, profilePhoto } = req.body;

      await user.update({
        firstName: firstName ? encrypt(firstName) : user.firstName,
        lastName: lastName ? encrypt(lastName) : user.lastName,
        specialization: specialization ? encrypt(specialization) : user.specialization,
        YoE: experience ? encrypt(experience) : user.YoE,
        bio: bio ? encrypt(bio) : user.bio,
        linkPorto: portofolio ? encrypt(portofolio) : user.linkPorto,
        photo_path: profilePhoto || user.photo_path
      });

      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: {
          photo_path: profilePhoto || user.photo_path
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error });
    }
  }
];