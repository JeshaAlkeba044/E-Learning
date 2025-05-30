"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes")); // Pastikan Anda sudah mengimpor adminRoutes
const learnerRoutes_1 = __importDefault(require("./routes/learnerRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const tutorRoutes_1 = __importDefault(require("./routes/tutorRoutes"));
const uploadController_1 = require("./controllers/uploadController");
const models_1 = require("./models");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
// Konfigurasi penyimpanan
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});
const app = (0, express_1.default)();
// Konfigurasi CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:5502', 'http://127.0.0.1:5502'],
    credentials: true
}));
app.use(body_parser_1.default.json());
const uploadsDir = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/learner', learnerRoutes_1.default);
app.use('/api/transaction', transactionRoutes_1.default);
app.use('/api/tutor', tutorRoutes_1.default);
// Upload image route
app.post('/api/upload', upload.single('image'), uploadController_1.uploadImage);
app.delete('/api/upload/:filename', uploadController_1.deleteImage);
const PORT = process.env.PORT || 3000;
models_1.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
