import { PartialType } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
// No es necesario importar 'Type' aquí directamente si solo extiende PartialType de CreateDocumentDto
// y CreateDocumentDto ya tiene los decoradores @Type.

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
