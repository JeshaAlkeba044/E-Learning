import express from 'express';
import {
  getAllCourses,
  getCourseById,
  getCourseMaterials,
  getMaterialById
} from '../controllers/courseController';

import {
  getUserProgress,
  updateMaterialProgress,
  getDashboardLearner
} from '../controllers/progressController';

import {authenticate} from '../middleware/authMiddleware';
import { getMaterialsForLearner } from '../controllers/materialController';

const router = express.Router();

// Public routes
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.get('/courses/:id/materials', getCourseMaterials);
router.get('/materials/:id', getMaterialById);
router.get('/courses/:id/materials', getMaterialsForLearner);
router.get('/dashboard', getDashboardLearner);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/progress', getUserProgress);
router.put('/progress/materials/:materialId', updateMaterialProgress);

export default router;