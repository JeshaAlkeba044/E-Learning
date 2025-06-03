"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const courseController_1 = require("../controllers/courseController");
const materialController_1 = require("../controllers/materialController");
const path_1 = __importDefault(require("path"));
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
const upload = (0, multer_1.default)({ storage: storage });
const router = express_1.default.Router();
// Course routes
router.post('/courses', upload.single('thumbnail'), courseController_1.createCourse);
router.get('/courses/instructor/:id_user', courseController_1.getCoursesByInstructor);
router.put('/courses/:id', upload.single('thumbnail'), courseController_1.updateCourse);
router.get('/courses/:id', courseController_1.getCourseById);
router.delete('/courses/:id', courseController_1.deleteCourse);
// Material routes
router.post('/courses/:id_course/materials', materialController_1.createMaterial);
router.get('/courses/:id_course/materials', materialController_1.getMaterialsByCourse);
router.put('/materials/:id_material/content', materialController_1.updateMaterialContent);
router.put('/materials/:id_material', materialController_1.updateMaterial);
router.delete('/materials/:id_material', materialController_1.deleteMaterial);
router.put('/courses/:id_course/materials/reorder', materialController_1.reorderMaterials);
exports.default = router;
