import { Router, Request, Response } from 'express';
import { Course, Material, sequelize } from '../models';
import { v4 } from 'uuid';

const router = Router();

// Get course content
router.get('/courses/:courseId/content', async (req: Request, res: Response) => {
    try {
        const course = await Course.findByPk(req.params.courseId, {
            include: [
                {
                    model: Material,
                    as: 'materials_id',
                    order: [['sequence_order', 'ASC']]
                }
            ]
        });
        
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return 
        }
        
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save material content
router.put('/materials/:materialId/content', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        
        const material = await Material.findByPk(req.params.materialId);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return;
        }
        
        material.content = content;
        await material.save();
        
        res.json({ success: true, material });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new material
router.post('/courses/:courseId/materials', async (req: Request, res: Response) => {
    try {
        const { title, topic, sequence_order } = req.body;
        
        const course = await Course.findByPk(req.params.courseId);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return 
        }
        
        const material = await Material.create({
            id_material: v4(),
            title,
            topic,
            sequence_order,
            content: { blocks: [] }, // Initialize with empty content
            duration: 0,
            is_free: false,
            id_course: course.id_course
        });
        
        res.status(201).json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reorder materials
router.put('/courses/:courseId/materials/reorder', async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body;
        
        const transaction = await sequelize.transaction();
        
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                await Material.update(
                    { sequence_order: i + 1 },
                    { where: { id_material: orderedIds[i] }, transaction }
                );
            }
            
            await transaction.commit();
            res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload media for content blocks
router.post('/content-blocks/upload', async (req: Request, res: Response) => {
    try {
        // In a real app, you would handle file upload here
        // For simplicity, we'll just return a mock response
        const file = req.file; // Assuming you're using multer or similar
        
        res.json({
            success: true,
            url: `/uploads/${file?.filename}`,
            blockId: v4()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;