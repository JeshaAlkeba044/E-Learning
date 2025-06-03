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
exports.getMaterialsForLearner = exports.deleteMaterial = exports.updateMaterial = exports.reorderMaterials = exports.updateMaterialContent = exports.getMaterialsByCourse = exports.createMaterial = void 0;
const models_1 = require("../models");
const uuid_1 = require("uuid");
const createMaterial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_course } = req.params;
        const { title, topic, sequence_order } = req.body;
        const course = yield models_1.Course.findByPk(id_course);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const newMaterial = yield models_1.Material.create({
            id_material: (0, uuid_1.v4)(),
            title,
            topic,
            sequence_order: parseInt(sequence_order),
            content: { blocks: [] },
            duration: 0,
            is_free: false,
            id_course
        });
        res.status(201).json(newMaterial);
    }
    catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
});
exports.createMaterial = createMaterial;
const getMaterialsByCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_course } = req.params;
        const materials = yield models_1.Material.findAll({
            where: { id_course },
            order: [['sequence_order', 'ASC']]
        });
        res.json(materials);
    }
    catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});
exports.getMaterialsByCourse = getMaterialsByCourse;
// Update the updateMaterialContent function
const updateMaterialContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_material } = req.params;
        const { content } = req.body;
        // Validate request body
        if (!content || !content.blocks) {
            res.status(400).json({ error: 'Invalid content format' });
            return;
        }
        // Validate each block
        const validTypes = ['text', 'image', 'video', 'heading', 'resource'];
        for (const block of content.blocks) {
            if (!validTypes.includes(block.type)) {
                res.status(400).json({
                    error: `Invalid block type: ${block.type}`,
                    validTypes
                });
                return;
            }
            // Additional validation for specific block types
            if (block.type === 'image' || block.type === 'video' || block.type === 'resource') {
                if (!block.content) {
                    res.status(400).json({
                        error: `${block.type} block requires content URL`
                    });
                    return;
                }
            }
        }
        const material = yield models_1.Material.findByPk(id_material);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return;
        }
        // Update content
        material.content = content;
        yield material.save();
        res.json({
            success: true,
            material: Object.assign(Object.assign({}, material.toJSON()), { content // Ensure content is properly returned
             })
        });
    }
    catch (error) {
        console.error('Error saving material content:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.updateMaterialContent = updateMaterialContent;
const reorderMaterials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_course } = req.params;
        const { orderedIds } = req.body;
        const materials = yield models_1.Material.findAll({
            where: { id_course }
        });
        const updatePromises = materials.map((material) => __awaiter(void 0, void 0, void 0, function* () {
            const newOrder = orderedIds.indexOf(material.id_material);
            if (newOrder !== -1 && material.sequence_order !== newOrder + 1) {
                material.sequence_order = newOrder + 1;
                yield material.save();
            }
        }));
        yield Promise.all(updatePromises);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error reordering materials:', error);
        res.status(500).json({ error: 'Failed to reorder materials' });
    }
});
exports.reorderMaterials = reorderMaterials;
// Update material settings (title, topic, duration)
const updateMaterial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_material } = req.params;
        const { title, topic, duration } = req.body;
        const material = yield models_1.Material.findByPk(id_material);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return;
        }
        // Update material
        material.title = title;
        material.topic = topic;
        material.duration = duration;
        yield material.save();
        // Update course total duration
        const course = yield models_1.Course.findByPk(material.id_course);
        if (course) {
            const materials = yield models_1.Material.findAll({
                where: { id_course: course.id_course },
                attributes: ['duration']
            });
            const totalDuration = materials.reduce((sum, m) => sum + m.duration, 0);
            course.total_duration = totalDuration;
            yield course.save();
        }
        res.json(material);
    }
    catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ error: 'Failed to update material' });
    }
});
exports.updateMaterial = updateMaterial;
// Delete a material
const deleteMaterial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_material } = req.params;
        const material = yield models_1.Material.findByPk(id_material);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return;
        }
        const courseId = material.id_course;
        yield material.destroy();
        // Update sequence order for remaining materials
        const remainingMaterials = yield models_1.Material.findAll({
            where: { id_course: courseId },
            order: [['sequence_order', 'ASC']]
        });
        for (let i = 0; i < remainingMaterials.length; i++) {
            remainingMaterials[i].sequence_order = i + 1;
            yield remainingMaterials[i].save();
        }
        // Update course total duration
        const course = yield models_1.Course.findByPk(courseId);
        if (course) {
            const materials = yield models_1.Material.findAll({
                where: { id_course: courseId },
                attributes: ['duration']
            });
            const totalDuration = materials.reduce((sum, m) => sum + m.duration, 0);
            course.total_duration = totalDuration;
            yield course.save();
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});
exports.deleteMaterial = deleteMaterial;
// Get materials for a course (learner view)
const getMaterialsForLearner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_course } = req.params;
        const materials = yield models_1.Material.findAll({
            where: { id_course: id_course },
            order: [['sequence_order', 'ASC']],
            attributes: ['id_material', 'title', 'topic', 'duration', 'sequence_order', 'is_free', 'is_locked']
        });
        res.json(materials);
    }
    catch (error) {
        console.error('Error getting materials:', error);
        res.status(500).json({ error: 'Failed to get materials' });
    }
});
exports.getMaterialsForLearner = getMaterialsForLearner;
