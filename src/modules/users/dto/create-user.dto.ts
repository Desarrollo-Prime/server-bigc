import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(200, { message: 'El nombre no debe exceder 200 caracteres.' })
  firstName: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(200, { message: 'El apellido no debe exceder 200 caracteres.' })
  lastName: string;

  @ApiProperty({ description: 'Correo electrónico del usuario (único)', example: 'juan.perez@example.com' })
  @IsEmail({}, { message: 'Formato de correo electrónico inválido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @MaxLength(500, { message: 'El correo electrónico no debe exceder 500 caracteres.' })
  email: string;

  @ApiProperty({ description: 'Nombre de usuario (único)', example: 'jperez' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  @MaxLength(100, { message: 'El nombre de usuario no debe exceder 100 caracteres.' })
  userName: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'SecurePassword123*' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(100, { message: 'La contraseña no debe exceder 100 caracteres.' })
  // Regex para al menos una mayúscula, una minúscula, un número y un caracter especial
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
  })
  password: string;

  @ApiProperty({ description: 'Número de teléfono del usuario', example: '3001234567', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El teléfono no debe exceder 100 caracteres.' })
  phone?: string;

  @ApiProperty({ description: 'ID de la compañía a la que pertenece el usuario', example: 1 })
  @IsNotEmpty({ message: 'El ID de la compañía es obligatorio.' })
  companyId: number;

  @ApiProperty({ description: 'Nombre del rol del usuario (SuperAdministrador, Administrador, Usuario)', example: 'Usuario' })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  @Matches(/^(SuperAdministrador|Administrador|Usuario)$/, {
    message: 'El rol debe ser "SuperAdministrador", "Administrador" o "Usuario".',
  })
  roleName: string;
}