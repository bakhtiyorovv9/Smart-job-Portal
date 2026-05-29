import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class ResumeValidationPipe implements PipeTransform {
  private readonly allowedExtensions = ['.pdf', '.doc', '.docx'];
  private readonly maxSize = 5 * 1024 * 1024;

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Resume fayli majburiy');
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Faqat ${this.allowedExtensions.join(', ')} formatdagi fayllar qabul qilinadi`,
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('Fayl hajmi 5MB dan oshmasligi kerak');
    }

    return file;
  }
}
