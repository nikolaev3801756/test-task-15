import { Injectable, Resource } from '@angular/core';
import { DocumentDto, SaveDocumentDto } from '../models';
import { delay, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ApiService {
  getDocument(id: string): Resource<DocumentDto | null> {
    const value = {
      name: 'test doc',
      pages: [
        {
          number: 1,
          imageUrl: 'pages/1.png',
        },
        {
          number: 2,
          imageUrl: 'pages/2.png',
        },
        {
          number: 3,
          imageUrl: 'pages/3.png',
        },
        {
          number: 4,
          imageUrl: 'pages/4.png',
        },
        {
          number: 5,
          imageUrl: 'pages/5.png',
        },
      ],
    } as DocumentDto;

    return rxResource<DocumentDto | null, string>({
      stream: (id) => {
        return of(value).pipe(delay(2000));
      },
      defaultValue: null,
    }).asReadonly();
  }

  saveDocument(document: SaveDocumentDto): void {
    console.log(document);
  }
}
