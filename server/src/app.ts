import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes'; // Pastikan Anda sudah mengimpor adminRoutes
import learnerRoutes from './routes/learnerRoutes';
import transactionRoutes from './routes/transactionRoutes';
import tutorRoutes from './routes/tutorRoutes';
import { uploadImage, deleteImage } from './controllers/uploadController';
import {sequelize} from './models';
import path from 'path';
import multer from 'multer';


// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: ['http://localhost:5502', 'http://127.0.0.1:5502'],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`💥 ${req.method} ${req.originalUrl}`);
  next();
});


app.use(bodyParser.json());

const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/learner', learnerRoutes);

app.use('/api/transaction', transactionRoutes);
// Middleware untuk webhook Midtrans
app.post('/api/transaction/payment-notification', 
  express.json(), // Untuk parsing JSON body
  (req, res) => {
    // Delegate ke controller
    const transactionController = require('./controllers/transactionController');
    transactionController.paymentNotification(req, res);
  }
);

app.use('/api/tutor', tutorRoutes);

// Upload image route
app.post('/api/upload', upload.single('image'), uploadImage);
app.delete('/api/upload/:filename', deleteImage);


const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});