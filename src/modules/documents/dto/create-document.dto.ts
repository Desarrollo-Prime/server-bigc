import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'ID de la compañía a la que pertenece el documento', example: 1 })
  @IsNotEmpty({ message: 'El ID de la compañía es obligatorio.' })
  @IsNumber({}, { message: 'El ID de la compañía debe ser un número.' })
  companyId: number;

  @ApiProperty({ description: 'ID del área a la que pertenece el documento (opcional)', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del área debe ser un número.' })
  areaId?: number;

  @ApiProperty({ description: 'Nombre del documento', example: 'Políticas de Seguridad de la Información' })
  @IsString({ message: 'El nombre del documento debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del documento es obligatorio.' })
  @MaxLength(500, { message: 'El nombre del documento no debe exceder 500 caracteres.' })
  name: string;

  @ApiProperty({ description: 'Descripción del documento', example: 'Normas y directrices para la seguridad de los datos.', required: false })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  description?: string;

  @ApiProperty({ description: 'ID del estado del documento (e.g., 1 para Activo)', example: 1 })
  @IsNotEmpty({ message: 'El ID del estado es obligatorio.' })
  @IsNumber({}, { message: 'El ID del estado debe ser un número.' })
  statusId: number;
}