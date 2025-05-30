"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// Get course content
router.get('/courses/:courseId/content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield models_1.Course.findByPk(req.params.courseId, {
            include: [
                {
                    model: models_1.Material,
                    as: 'materials_id',
                    order: [['sequence_order', 'ASC']]
                }
            ]
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Save material content
router.put('/materials/:materialId/content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const material = yield models_1.Material.findByPk(req.params.materialId);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return;
        }
        material.content = content;
        yield material.save();
        res.json({ success: true, material });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Add new material
router.post('/courses/:courseId/materials', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, topic, sequence_order } = req.body;
        const course = yield models_1.Course.findByPk(req.params.courseId);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const material = yield models_1.Material.create({
            id_material: (0, uuid_1.v4)(),
            title,
            topic,
            sequence_order,
            content: { blocks: [] }, // Initialize with empty content
            duration: 0,
            is_free: false,
            id_course: course.id_course
        });
        res.status(201).json(material);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Reorder materials
router.put('/courses/:courseId/materials/reorder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderedIds } = req.body;
        const transaction = yield models_1.sequelize.transaction();
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                yield models_1.Material.update({ sequence_order: i + 1 }, { where: { id_material: orderedIds[i] }, transaction });
            }
            yield transaction.commit();
            res.json({ success: true });
        }
        catch (error) {
            yield transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Upload media for content blocks
router.post('/content-blocks/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real app, you would handle file upload here
        // For simplicity, we'll just return a mock response
        const file = req.file; // Assuming you're using multer or similar
        res.json({
            success: true,
            url: `/uploads/${file === null || file === void 0 ? void 0 : file.filename}`,
            blockId: (0, uuid_1.v4)()
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}));
exports.default = router;
