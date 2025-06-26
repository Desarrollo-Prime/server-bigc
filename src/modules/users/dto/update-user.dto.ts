import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Indica si el usuario está habilitado', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de habilitación debe ser un booleano.' })
  enable?: boolean;

  @ApiProperty({ description: 'Indica si el usuario está bloqueado', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado de bloqueo debe ser un booleano.' })
  blocked?: boolean;
}