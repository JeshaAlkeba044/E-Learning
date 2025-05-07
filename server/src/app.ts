import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import {sequelize} from './models';

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: ['http://localhost:5502', 'http://127.0.0.1:5502'], // Sesuaikan dengan port frontend Anda
  credentials: true
}));

app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});