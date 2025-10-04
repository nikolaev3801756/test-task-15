import { DocumentPageDto } from './document-page-dto';

export interface DocumentDto {
  readonly name: string;
  readonly pages: DocumentPageDto[];
}
