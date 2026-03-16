import fs from 'fs';
import path from 'path';

export class FileManager {
    private static uploadDir = path.join(__dirname, '../../Plastik-HB-FE/src/assets/productImage');

    /**
     * Delete file from filesystem
     */
    static deleteFile(filename: string): boolean {
        try {
            if (!filename || filename === '/placeholder.jpg' || filename.startsWith('http')) {
                return false;
            }

            const filePath = path.join(this.uploadDir, filename);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`✅ File deleted: ${filename}`);
                return true;
            } else {
                console.log(`⚠️ File not found: ${filename}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error deleting file ${filename}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple files
     */
    static deleteFiles(filenames: string[]): void {
        filenames.forEach(filename => {
            if (filename && filename !== '/placeholder.jpg' && !filename.startsWith('http')) {
                this.deleteFile(filename);
            }
        });
    }

    /**
     * Check if file exists
     */
    static fileExists(filename: string): boolean {
        try {
            if (!filename || filename === '/placeholder.jpg' || filename.startsWith('http')) {
                return false;
            }

            const filePath = path.join(this.uploadDir, filename);
            return fs.existsSync(filePath);
        } catch (error) {
            console.error(`Error checking file ${filename}:`, error);
            return false;
        }
    }

    /**
     * Get file size
     */
    static getFileSize(filename: string): number {
        try {
            if (!filename || filename === '/placeholder.jpg' || filename.startsWith('http')) {
                return 0;
            }

            const filePath = path.join(this.uploadDir, filename);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                return stats.size;
            }
            return 0;
        } catch (error) {
            console.error(`Error getting file size ${filename}:`, error);
            return 0;
        }
    }

    /**
     * Clean up failed uploads
     */
    static cleanupFailedUpload(files: Express.Multer.File[] | Express.Multer.File): void {
        try {
            if (Array.isArray(files)) {
                const filenames = files.map(file => file.filename);
                this.deleteFiles(filenames);
            } else if (files) {
                this.deleteFile(files.filename);
            }
        } catch (error) {
            console.error('Error cleaning up failed upload:', error);
        }
    }
}
