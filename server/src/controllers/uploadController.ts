import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            res.status(400).json({ 
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
            });
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            fs.unlinkSync(req.file.path);
            res.status(400).json({ 
                success: false,
                error: 'File too large. Maximum size is 5MB.' 
            });
            return;
        }

        // Generate a unique filename
        const fileExt = path.extname(req.file.originalname);
        const uniqueFilename = `${uuidv4()}${fileExt}`;
        const newPath = path.join(uploadDir, uniqueFilename);

        // Rename the file
        fs.renameSync(req.file.path, newPath);

        res.json({
            success: true,
            url: `/uploads/${uniqueFilename}`,
            filename: uniqueFilename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        
        // Clean up if file was uploaded but error occurred
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            success: false,
            error: 'Failed to upload image' 
        });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        
        // Validate filename to prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            res.status(400).json({ 
                success: false,
                error: 'Invalid filename' 
            });
            return;
        }

        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ 
                success: false,
                error: 'File not found' 
            });
            return
        }

        // Check if file is actually an image (optional)
        const fileExt = path.extname(filename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExtensions.includes(fileExt)) {
            res.status(400).json({ 
                success: false,
                error: 'Invalid file type' 
            });

            return;
        }

        fs.unlinkSync(filePath);
        res.json({ 
            success: true,
            message: 'File deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete image' 
        });
    }
};