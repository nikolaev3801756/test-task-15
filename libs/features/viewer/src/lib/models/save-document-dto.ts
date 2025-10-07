import { AnnotationDto } from './annotation-dto';
import { DocumentDto } from './document-dto';

export interface SaveDocumentDto extends DocumentDto {
  readonly annotations: AnnotationDto[];
}
