import { Request, Response } from 'express';
import { User, Course, Material, sequelize } from '../models';
import { UserMaterialProgress } from '../models/UserMaterialProgress';
import { Transaction } from '../models/Transaction';
import { authenticate } from '../middleware/authMiddleware';
import { decrypt } from '../utils/cryptoUtil';
import { Op } from 'sequelize';

export const getUserProgress = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;

      // Ambil transaksi sukses
      const transactions = await Transaction.findAll({
        where: { id_user: user.id_user, status: 'completed' },
        include: [
          {
            model: Course,
            include: [
              {
                model: User,
                as: 'instructor_Id',
                attributes: ['role', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      });

      // Kumpulkan progress untuk tiap kursus
      const progress = await Promise.all(
        transactions.map(async (transaction) => {
          const course = transaction.course;

          if (!course || !course.instructor_Id) return null;

          // Cek role instruktur
          const decryptedRole = decrypt(course.instructor_Id.role);
          if (decryptedRole !== 'tutor') return null;

          // Ambil semua materi
          const materials = await Material.findAll({
            where: { id_course: course.id_course },
            attributes: ['id_material'],
          });

          const totalMaterials = materials.length;

          const completedMaterials = await UserMaterialProgress.count({
            where: {
              id_user: user.id_user,
              is_completed: true,
              id_material: materials.map((m) => m.id_material),
            },
          });

          // Ambil lastAccessed dari UserMaterialProgress
          const lastMaterialIds = materials.map((m) => m.id_material);
          const lastProgress = await UserMaterialProgress.findOne({
            where: {
              id_user: user.id_user,
              id_material: { [Op.in]: lastMaterialIds },
            },
            order: [['last_accessed', 'DESC']],
          });

          const decryptedFirstname = decrypt(course.instructor_Id.firstName);
          const decryptedLastname = decrypt(course.instructor_Id.lastName);

          return {
            courseId: course.id_course,
            courseTitle: course.title,
            courseCategory: course.category,
            thumbnail: course.thumbnail_path || '../../assets/img/course-placeholder.jpg',
            instructor: `${decryptedFirstname} ${decryptedLastname}`,
            progress: totalMaterials > 0
              ? Math.round((completedMaterials / totalMaterials) * 100)
              : 0,
            module_done: completedMaterials,
            total_module: totalMaterials,
            lastAccessed: lastProgress?.last_accessed,
            totalHours: Math.round(course.total_duration / 60) || 0,
          };
        })
      );

      // Filter null (jika ada yang gagal karena bukan tutor)
      const filteredProgress = progress.filter((p) => p !== null);

      console.log('\n\n\n\nUser progress:', filteredProgress);

      res.status(200).json({ success: true, data: filteredProgress });
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil progress user' });
    }
  },
];



// Update the updateMaterialProgress function
export const updateMaterialProgress = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user?.id_user;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return 
    }

    // Find or create progress record
    const [progress, created] = await UserMaterialProgress.findOrCreate({
      where: { id_user: userId, id_material: materialId },
      defaults: { 
        is_completed: isCompleted,
        last_accessed: new Date()
      }
    });
    
    if (!created) {
      progress.is_completed = isCompleted;
      progress.last_accessed = new Date();
      await progress.save();
    }

    // Update course total progress
    const material = await Material.findByPk(materialId);
    if (material) {
      const courseId = material.id_course;
      await updateCourseProgress(userId, courseId);
    }
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

async function updateCourseProgress(userId: string, courseId: string) {
  // Calculate new progress for the course
  const totalMaterials = await Material.count({
    where: { id_course: courseId }
  });

  const completedMaterials = await UserMaterialProgress.count({
    where: {
      id_user: userId,
      is_completed: true,
      id_material: {
        [Op.in]: sequelize.literal(`(SELECT id_material FROM materials WHERE id_course = '${courseId}')`)
      }
    }
  });

  return {
    totalMaterials,
    completedMaterials,
    progress: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0
  };
}


export const getDashboardLearner = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      if (!user.id_user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const transactions = await Transaction.findAll({
        where: {
          id_user: user.id_user,
          status: "completed",
        },
        include: [
          {
            model: Course,
            as: "course",
          },
        ],
      });

      const activeTransactions = transactions.filter((trx) => {
        const course = trx.course as Course;
        return course?.is_active;
      });

      const activeCourses = activeTransactions.length;
      const studyHours = activeTransactions.reduce((total, trx) => {
        const course = trx.course as Course;
        return total + (course?.total_duration || 0);
      }, 0);

      const totalModuleCompleted = await UserMaterialProgress.count({
        where: {
          id_user: user.id_user,
          is_completed: true,
        },
      });

      res.json({
        activeCourses,
        studyHours: Math.floor(studyHours / 60),
        moduleCompleted: totalModuleCompleted,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", detail: error.message });
    }
  },
];

export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id_user;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return 
    }

    // Hitung total material dalam course
    const totalMaterials = await Material.count({
      where: { id_course: id }
    });

    // Hitung material yang sudah diselesaikan
    const completedMaterials = await UserMaterialProgress.count({
      where: {
        id_user: userId,
        is_completed: true,
        id_material: {
          [Op.in]: sequelize.literal(`(SELECT id_material FROM materials WHERE id_course = '${id}')`)
        }
      }
    });

    // Hitung progress dalam persentase
    const progress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

    res.json({
      totalMaterials,
      completedMaterials,
      progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMaterialProgress = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const userId = req.user?.id_user;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return 
    }

    const progress = await UserMaterialProgress.findOne({
      where: {
        id_user: userId,
        id_material: materialId
      }
    });

    res.json({
      is_completed: progress?.is_completed || false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};