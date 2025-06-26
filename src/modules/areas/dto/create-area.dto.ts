import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ description: 'ID de la compañía a la que pertenece el área', example: 1 })
  @IsNotEmpty({ message: 'El ID de la compañía es obligatorio.' })
  companyId: number;

  @ApiProperty({ description: 'Nombre del área (único por compañía)', example: 'Recursos Humanos' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no debe exceder 100 caracteres.' })
  name: string;

  @ApiProperty({ description: 'Descripción del área', example: 'Gestión de personal y nómina', required: false })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @MaxLength(500, { message: 'La descripción no debe exceder 500 caracteres.' })
  description?: string;
}