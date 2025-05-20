import express from 'express';
import multer from 'multer';
import {
    createCourse,
    getCourseById,
    getCoursesByInstructor,
    updateCourse,
    deleteCourse
} from '../controllers/courseController';
import {
    createMaterial,
    getMaterialsByCourse,
    updateMaterialContent,
    reorderMaterials,
    updateMaterial,
    deleteMaterial
} from '../controllers/materialController';
import path from 'path';

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


const upload = multer({ storage: storage });
const router = express.Router();

// Course routes
router.post('/courses', upload.single('thumbnail'), createCourse);
router.get('/courses/instructor/:id_user', getCoursesByInstructor);
router.put('/courses/:id_course', upload.single('thumbnail'), updateCourse);
router.get('/courses/:id_course', getCourseById);
router.delete('/courses/:id_course', deleteCourse);

// Material routes
router.post('/courses/:id_course/materials', createMaterial);
router.get('/courses/:id_course/materials', getMaterialsByCourse);
router.put('/materials/:id_material/content', updateMaterialContent);
router.put('/materials/:id_material', updateMaterial);
router.delete('/materials/:id_material', deleteMaterial);
router.put('/courses/:id_course/materials/reorder', reorderMaterials);

export default router;