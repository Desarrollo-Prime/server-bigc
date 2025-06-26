import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'admin' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  userName: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Admin123*' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(1, { message: 'La contraseña no puede estar vacía.' }) // Ajustar según complejidad real
  password: string;
}
