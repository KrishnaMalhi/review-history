import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]);

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSizeBytes: number;

  constructor(private readonly config: ConfigService) {
    const uploadDirName = this.config.get<string>('UPLOAD_DIR', 'uploads');
    this.uploadDir = path.resolve(process.cwd(), uploadDirName);
    this.baseUrl = this.config.get<string>('API_BASE_URL', 'http://localhost:5000');
    this.maxFileSizeBytes = Number(this.config.get<string>('UPLOAD_MAX_FILE_SIZE_MB', '5')) * 1024 * 1024;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<{ url: string; fileName: string }> {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('File type not allowed. Only JPEG, PNG, GIF, WEBP, and PDF are accepted.');
    }
    if (file.size > this.maxFileSizeBytes) {
      const maxMb = this.maxFileSizeBytes / (1024 * 1024);
      throw new BadRequestException(`File size exceeds the ${maxMb} MB limit.`);
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const fileName = `${uuidv4()}${ext}`;
    const destPath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(destPath, file.buffer);
    this.logger.log(`Saved upload: ${fileName}`);

    return {
      fileName,
      url: `${this.baseUrl}/uploads/${fileName}`,
    };
  }
}
