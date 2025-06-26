import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../entities/document.entity';
import { Company } from '../../entities/company.entity';
import { Area } from '../../entities/area.entity';
import { ProfileUser } from '../../entities/profile-user.entity';
import { DocumentStatus } from '../../entities/document-status.entity';
import { DocumentPermission } from '../../entities/document-permission.entity';
import { AuthModule } from '../../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Company, Area, ProfileUser, DocumentStatus, DocumentPermission]),
    AuthModule,
    ConfigModule, // Importar ConfigModule para usar ConfigService
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: './uploads', // Directorio donde se guardarán los archivos
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024, // Limite de 10MB por archivo (configurable)
        },
        fileFilter: (req, file, callback) => {
          // Opcional: Filtrar tipos de archivo permitidos
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/)) {
            return callback(new Error('Solo se permiten archivos de imagen, PDF y documentos.'), false);
          }
          callback(null, true);
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}