import { Request, Response } from 'express';
import { Course, Material, User } from '../models';
import { decrypt, encrypt } from '../utils/cryptoUtil';
import { v4 } from 'uuid';
import { Op } from 'sequelize';
import fs from 'fs';
import { fn, col } from 'sequelize';
import { authenticate } from '../middleware/authMiddleware';
import { Transaction } from '../models/Transaction';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, sort, search } = req.query;

    const where: any = {};
    const order: any = [['created_at', 'DESC']];

    if (category && category !== 'all') {
      where.category = category;
    }

    if (level && level !== 'all') {
      where.level = level;
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (sort) {
      switch (sort) {
        case 'newest':
          order[0] = ['created_at', 'DESC'];
          break;
        case 'highest-rated':
          order[0] = ['rating', 'DESC'];
          break;
        case 'price-low':
          order[0] = ['price', 'ASC'];
          break;
        case 'price-high':
          order[0] = ['price', 'DESC'];
          break;
        default:
          order[0] = ['enrollment_count', 'DESC'];
      }
    }

    const courses = await Course.findAll({
      where,
      order,
      include: [
        {
          model: User,
          as: 'instructor_Id',
          attributes: ['firstName', 'lastName', 'photo_path']
        }
      ]
    });

    const courseIds = courses.map(course => course.id_course);

    const materialCounts = await Material.findAll({
      attributes: ['id_course', [fn('COUNT', col('id_material')), 'material_count']],
      where: {
        id_course: {
          [Op.in]: courseIds
        }
      },
      group: ['id_course']
    });

    const materialCountMap: { [key: string]: number } = {};
    materialCounts.forEach((item: any) => {
      materialCountMap[item.id_course] = parseInt(item.getDataValue('material_count'));
    });

    const coursesWithCounts = courses.map(course => {
      const material_count = materialCountMap[course.id_course] || 0;

      const courseData = course.toJSON();

      // Cek dan decrypt nama instructor
      if (courseData.instructor_Id) {
        courseData.instructor_Id.firstName = decrypt(courseData.instructor_Id.firstName);
        courseData.instructor_Id.lastName = decrypt(courseData.instructor_Id.lastName);
      }

      return {
        ...courseData,
        material_count
      };
    });

    res.json(coursesWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecommendationCourses = [authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    console.log("\n\n\n\n\nUser ID:", user.id_user);

    const { limit } = req.query;

    if (!user.id_user) {
      res.status(400).json({ message: 'userId diperlukan' });
      return;
    }

    const where: any = {};
    const order: any = [['created_at', 'DESC']];
    const parsedLimit = limit ? parseInt(limit as string) : undefined;


    // 🔥 Ambil semua transaksi si user, jadi tahu course yang udah dimiliki
    const userTransactions = await Transaction.findAll({
      where: { id_user: user.id_user },
      attributes: ['id_course'],
    });

    const ownedCourseIds = userTransactions.map((trx: any) => trx.id_course);

    // 🔥 Ambil course yang belum dimiliki user
    const courses = await Course.findAll({
      where: {
        ...where,
        id_course: { [Op.notIn]: ownedCourseIds },
        is_active: true // Optional: hanya course yang aktif
      },
      order,
      limit: parsedLimit,
      include: [
        {
          model: User,
          as: 'instructor_Id',
          attributes: ['firstName', 'lastName', 'photo_path']
        }
      ]
    });

    const courseIds = courses.map(course => course.id_course);

    const materialCounts = await Material.findAll({
      attributes: ['id_course', [fn('COUNT', col('id_material')), 'material_count']],
      where: { id_course: { [Op.in]: courseIds } },
      group: ['id_course']
    });

    const materialMap: { [key: string]: number } = {};
    materialCounts.forEach((item: any) => {
      materialMap[item.id_course] = parseInt(item.getDataValue('material_count'));
    });

    const recommendations = courses.map(course => {
      const courseData = course.toJSON();
      const total_module = materialMap[course.id_course] || 0;

      const instructorFirstName = decrypt(courseData.instructor_Id?.firstName || '');
      const instructorLastName = decrypt(courseData.instructor_Id?.lastName || '');

      return {
        courseId: courseData.id_course,
        title: courseData.title,
        category: courseData.category,
        thumbnail: courseData.thumbnail_path,
        instructor: `${instructorFirstName} ${instructorLastName}`,
        total_module,
        totalHours: Math.round(courseData.total_duration / 60),
        price: courseData.price,
      };
    });

    res.json(recommendations);
  } catch (error) {
    console.error('[getRecommendationCourses]', error);
    res.status(500).json({ message: 'Kai error bentar, tapi masih sayang kamu. Tunggu sebentar ya ❤️' });
  }
}];

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("Fetching course with ID:", id);
    console.log("Request params:", req.params);

    const course = await Course.findByPk(id, {  
      include: [
        {
          model: User,
          as: 'instructor_Id',
          attributes: ['firstName', 'lastName', 'photo_path', 'bio']
        },
        {
          model: Material,
          as: 'materials_id',
          order: [['sequence_order', 'ASC']]
        }
      ]
    });
    
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return 
    }
    
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseMaterials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const materials = await Material.findAll({
      where: { id_course: id },
      order: [['sequence_order', 'ASC']]
    });
    
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    
    if (!material) {
      res.status(404).json({ message: 'Material not found' });
      return;
    }

    // Ensure content is properly formatted
    let content = material.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        content = { blocks: [] };
      }
    } else if (!content || !content.blocks) {
      content = { blocks: [] };
    }

    // Return material with properly formatted content
    res.json({
      ...material.toJSON(),
      content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// For Tutor

export const createCourse = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        const { title, category, description, price, id_user } = req.body;
        const thumbnail_path = req.file?.path || '';

        const newCourse = await Course.create({
            id_course: v4(),
            title,
            category,
            description,
            price: parseFloat(price),
            thumbnail_path,
            id_user
        });

        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const getCoursesByInstructor = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        const { id_user } = req.params;
        const courses = await Course.findAll({
            where: { id_user },
            include: [
                {
                    model: Material,
                    as: 'materials_id'
                }
            ]
        });

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const updateCourse = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        const { id_course } = req.params;
        const { title, category, description, price } = req.body;

        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file); // Cek apakah file terupload

        const course = await Course.findByPk(id_course);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }

        // Update data course
        course.title = title;
        course.category = category;
        course.description = description;
        course.price = parseFloat(price);
        
        // Jika ada file yang diupload
        if (req.file) {
            // Hapus file lama jika ada
            if (course.thumbnail_path) {
                try {
                    fs.unlinkSync(course.thumbnail_path);
                } catch (err) {
                    console.error('Error deleting old thumbnail:', err);
                }
            }
            course.thumbnail_path = req.file.path;
        }

        await course.save();

        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return 
        }

        await course.destroy();

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};