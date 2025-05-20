import { Request, Response } from 'express';
import { User, Course, Material } from '../models';
import { UserMaterialProgress } from '../models/UserMaterialProgress';

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;
    
    // Get user's enrolled courses
    const enrolledCourses = await Course.findAll({
      include: [{
        model: User,
        as: 'transactions_id',
        where: { id_user: userId },
        attributes: []
      }]
    });
    
    // Calculate progress for each course
    const progress = await Promise.all(enrolledCourses.map(async (course) => {
      const totalMaterials = await Material.count({ where: { id_course: course.id_course } });
      const completedMaterials = await Material.count({
        where: { 
          id_course: course.id_course,
          // Assuming you have a UserMaterialProgress model to track completion
          // This is a simplified version
          '$user_progress.id_user$': userId,
          '$user_progress.is_completed$': true
        },
        include: [{
          model: UserMaterialProgress,
          as: 'user_progress',
          required: true
        }]
      });
      
      return {
        courseId: course.id_course,
        courseTitle: course.title,
        thumbnail: course.thumbnail_path,
        progress: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
        lastAccessed: new Date() // Should come from actual tracking
      };
    }));
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMaterialProgress = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user?.id_user;
    
    // Find or create progress record
    const [progress, created] = await UserMaterialProgress.findOrCreate({
      where: { id_user: userId, id_material: materialId },
      defaults: { is_completed: isCompleted }
    });
    
    if (!created) {
      progress.is_completed = isCompleted;
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};