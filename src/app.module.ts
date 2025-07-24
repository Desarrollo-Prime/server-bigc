import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AreasModule } from './modules/areas/areas.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RolesModule } from './modules/roles/roles.module';
import { CompaniesModule } from './modules/companies/companies.module'; // ¡Importa el nuevo CompaniesModule!
import { DocumentStatusesModule } from './modules/document-statuses/document-statuses.module'; // ¡Importa el nuevo DocumentStatusesModule!
import databaseConfig from './config/database.config';
import { Role } from './entities/role.entity';
import { Company } from './entities/company.entity';
import { ProfileUser } from './entities/profile-user.entity';
import { UserRole } from './entities/user-role.entity';
import { Area } from './entities/area.entity';
import { DocumentStatus } from './entities/document-status.entity';
import { Document } from './entities/document.entity';
import { DocumentPermission } from './entities/document-permission.entity';

@Module({
  imports: [
    // Cargar variables de entorno desde .env
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
      load: [databaseConfig], // Carga la configuración de la base de datos
    }),
    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
    }),
    // Registrar todas las entidades para que TypeORM las reconozca
    TypeOrmModule.forFeature([
      Role,
      Company,
      ProfileUser,
      UserRole,
      Area,
      DocumentStatus,
      Document,
      DocumentPermission,
    ]),
    AuthModule,
    UsersModule,
    AreasModule,
    DocumentsModule,
    RolesModule,
    CompaniesModule, // ¡Añade CompaniesModule aquí!
    DocumentStatusesModule, // ¡Añade DocumentStatusesModule aquí!
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
