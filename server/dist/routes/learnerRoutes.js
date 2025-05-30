"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const progressController_1 = require("../controllers/progressController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const materialController_1 = require("../controllers/materialController");
const router = express_1.default.Router();
// Public routes
router.get('/courses', courseController_1.getAllCourses);
router.get('/coursesRec', courseController_1.getRecommendationCourses); // Assuming search is handled by the same controller
router.get('/courses/:id', courseController_1.getCourseById);
router.get('/courses/:id/materials', courseController_1.getCourseMaterials);
router.get('/materials/:id', courseController_1.getMaterialById);
router.get('/courses/:id/materials', materialController_1.getMaterialsForLearner);
router.get('/dashboard', progressController_1.getDashboardLearner);
// Protected routes (require authentication)
router.use(authMiddleware_1.authenticate);
router.get('/progress', progressController_1.getUserProgress);
router.put('/progress/materials/:materialId', progressController_1.updateMaterialProgress);
router.get('/courses/:id/progress', authMiddleware_1.authenticate, progressController_1.getCourseProgress);
router.get('/progress/materials/:materialId', authMiddleware_1.authenticate, progressController_1.getMaterialProgress);
exports.default = router;
