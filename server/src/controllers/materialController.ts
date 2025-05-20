import { Request, Response } from 'express';
import { Material, Course } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export const createMaterial = async (req: Request, res: Response) => {
    try {
        const { id_course } = req.params;
        const { title, topic, sequence_order } = req.body;

        const course = await Course.findByPk(id_course);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return 
        }

        const newMaterial = await Material.create({
            id_material: uuidv4(),
            title,
            topic,
            sequence_order: parseInt(sequence_order),
            content: { blocks: [] },
            duration: 0,
            is_free: false,
            id_course
        });

        res.status(201).json(newMaterial);
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
};

export const getMaterialsByCourse = async (req: Request, res: Response) => {
    try {
        const { id_course } = req.params;
        const materials = await Material.findAll({
            where: { id_course },
            order: [['sequence_order', 'ASC']]
        });

        res.json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};

export const updateMaterialContent = async (req: Request, res: Response) => {
      try {

    const { id_material } = req.params;
    const { content } = req.body;
    
    // Validate request body
    if (!content || !content.blocks) {
        res.status(400).json({ error: 'Invalid content format' });
      return;
    }

    const material = await Material.findByPk(id_material);
    if (!material) {
        res.status(404).json({ error: 'Material not found' });
      return;
    }

    // Validate content structure
    try {
      material.content = content;
      await material.save();
      res.json({ success: true, material });
      return 
    } catch (validationError: any) {
        res.status(400).json({ 
        error: 'Invalid content structure',
        details: validationError.errors 
      });
        return 
    }
  } catch (error) {
    console.error('Error saving material content:', error);
    res.status(500).json({ error: 'Server error' });
    return 
  }
};

export const reorderMaterials = async (req: Request, res: Response) => {
    try {
        const { id_course } = req.params;
        const { orderedIds } = req.body;

        const materials = await Material.findAll({
            where: { id_course }
        });

        const updatePromises = materials.map(async (material) => {
            const newOrder = orderedIds.indexOf(material.id_material);
            if (newOrder !== -1 && material.sequence_order !== newOrder + 1) {
                material.sequence_order = newOrder + 1;
                await material.save();
            }
        });

        await Promise.all(updatePromises);

        res.json({ success: true });
    } catch (error) {
        console.error('Error reordering materials:', error);
        res.status(500).json({ error: 'Failed to reorder materials' });
    }
};



// Update material settings (title, topic, duration)
export const updateMaterial = async (req: Request, res: Response) => {
    try {
        const { id_material } = req.params;
        const { title, topic, duration } = req.body;

        const material = await Material.findByPk(id_material);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return 
        }

        // Update material
        material.title = title;
        material.topic = topic;
        material.duration = duration;
        await material.save();

        // Update course total duration
        const course = await Course.findByPk(material.id_course);
        if (course) {
            const materials = await Material.findAll({
                where: { id_course: course.id_course },
                attributes: ['duration']
            });
            
            const totalDuration = materials.reduce((sum, m) => sum + m.duration, 0);
            course.total_duration = totalDuration;
            await course.save();
        }

        res.json(material);
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ error: 'Failed to update material' });
    }
};

// Delete a material
export const deleteMaterial = async (req: Request, res: Response) => {
    try {
        const { id_material } = req.params;

        const material = await Material.findByPk(id_material);
        if (!material) {
            res.status(404).json({ error: 'Material not found' });
            return 
        }

        const courseId = material.id_course;
        await material.destroy();

        // Update sequence order for remaining materials
        const remainingMaterials = await Material.findAll({
            where: { id_course: courseId },
            order: [['sequence_order', 'ASC']]
        });

        for (let i = 0; i < remainingMaterials.length; i++) {
            remainingMaterials[i].sequence_order = i + 1;
            await remainingMaterials[i].save();
        }

        // Update course total duration
        const course = await Course.findByPk(courseId);
        if (course) {
            const materials = await Material.findAll({
                where: { id_course: courseId },
                attributes: ['duration']
            });
            
            const totalDuration = materials.reduce((sum, m) => sum + m.duration, 0);
            course.total_duration = totalDuration;
            await course.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
};

// Get materials for a course (learner view)
export const getMaterialsForLearner = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        const materials = await Material.findAll({
            where: { id_course: courseId },
            order: [['sequence_order', 'ASC']],
            attributes: ['id_material', 'title', 'topic', 'duration', 'sequence_order', 'is_free', 'is_locked']
        });

        res.json(materials);
    } catch (error) {
        console.error('Error getting materials:', error);
        res.status(500).json({ error: 'Failed to get materials' });
    }
};

