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
            imageUrl: `/uploads/${uniqueFilename}`,
            filename: uniqueFilename
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