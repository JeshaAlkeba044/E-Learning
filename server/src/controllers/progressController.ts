import { Request, Response } from 'express';
import { User, Course, Material } from '../models';
import { UserMaterialProgress } from '../models/UserMaterialProgress';
import { Transaction } from '../models/Transaction';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { decrypt, encrypt, hashEmail } from '../utils/cryptoUtil';

// import { Op } from 'sequelize';
// import { v4 } from 'uuid';
// import { UserMaterialProgress } from '../models/UserMaterialProgress';
export const getUserProgress = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;

      // Cari semua transaksi user yang sudah berhasil (misal status 'verified' atau 'paid')
      const transactions = await Transaction.findAll({
        where: { id_user: user.id_user, status: 'verified' }, // sesuaikan status transaksi yang valid
        include: [
          {
            model: Course,
            include: [
              {
                model: User,
                as: 'instructor_Id', // sesuai relasi Course ke User instructor
                attributes: ['role', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      });

      // Ambil list course dari transaksi user
      const progress = await Promise.all(
        transactions.map(async (transaction) => {
          const course = transaction.course;

          // Hitung total dan completed materials
          const totalMaterials = await Material.count({ where: { id_course: course.id_course } });
          const completedMaterials = await Material.count({
            where: { id_course: course.id_course },
            include: [
              {
                model: UserMaterialProgress,
                as: 'user_progress',
                where: { id_user: user.id_user, is_completed: true },
                required: true,
              },
            ],
          });

          // Decrypt data instructor
          const decryptedRole = decrypt(course.instructor_Id.role);
          if (decryptedRole !== 'tutor') {
            // Jika bukan tutor, abaikan course ini
            return null;
          }

          const decryptedFirstname = decrypt(course.instructor_Id.firstName);
          const decryptedLastname = decrypt(course.instructor_Id.lastName);

          return {
            id: course.id_course,
            title: course.title,
            thumbnail: course.thumbnail_path || '../../assets/img/course-placeholder.jpg',
            instructor: `${decryptedFirstname} ${decryptedLastname}`,
            progress: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
            lastAccessed: transaction.created_at || new Date(),
            totalHours: Math.round(course.total_duration / 60),
          };
        })
      );

      // Filter yang null (course bukan tutor)
      const filteredProgress = progress.filter((p) => p !== null);

      res.json(filteredProgress);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];


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
          status: "success",
        },
        include: [
          {
            model: Course,
            as: "course",
            where: { is_active: true },
          },
        ],
      });

      const activeCourses = transactions.length;
      const studyHours = transactions.reduce((total, trx) => {
        const course = trx.course as Course;
        return total + (course?.total_duration || 0);
      }, 0);

      // // 🔥 Tambahan untuk total modul diselesaikan
      const totalModuleCompleted = await UserMaterialProgress.count({
        where: {
          id_user: user.id_user,
          is_completed: true,
        },
      });

      res.json({
        activeCourses,
        studyHours: Math.floor(studyHours / 60), // dari menit ke jam
        moduleCompleted: totalModuleCompleted,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", detail: error.message });
    }
  },
];
