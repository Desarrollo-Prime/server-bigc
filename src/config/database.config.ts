import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno desde .env
config();

// Configuración de la base de datos para TypeORM
const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || '5432'), // Usar Number() para asegurar el tipo
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'bigc',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')], // Cargar todas las entidades
  synchronize: false, // ¡IMPORTANTE! NUNCA usar `true` en producción. Se asume que el esquema ya está creado.
  logging: true, // Habilita el log de las consultas SQL (útil para desarrollo)
});

export default databaseConfig;