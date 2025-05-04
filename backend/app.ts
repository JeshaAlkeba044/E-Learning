import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Course } from './models/Course';
import { Material } from './models/Material';
import { User } from './models/User';
import { Transaction } from './models/Transaction';
import tutorCoursesRouter from './routes/ALlCoursePerTutor';
import coursePerTutorRouter from './routes/CoursePerTutor';
import adminTutorRouter from './routes/AdminTutor';
import adminSatuTutorRouter from './routes/AdminSatuTutor';
import paymentRouter from './routes/Payment';
import transactionRouter from './routes/Transaction';

import config from './config/config.json';
import cors from 'cors';

const app = express();

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(express.json());

const sequelize = new Sequelize({
    ...config.development,
    models: [User, Material, Course, Transaction],
});

app.use('/tutors/:tutorId/courses', tutorCoursesRouter); // buat get dan post course dari tutor tertentu
app.use('/tutors/:tutorId/courses/:courseId', coursePerTutorRouter); // buat edit dan delete course tertentu dari tutor tertentu
app.use('/tutors', adminTutorRouter); // buat get dan post tutor 
app.use('/tutors/:tutorId', adminSatuTutorRouter); // buat edit dan delete tutor tertentu
app.use('/payments/:paymentId', paymentRouter); // buat update payment tertentu
app.use('/transactions', transactionRouter); // buat get dan post transaction

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});