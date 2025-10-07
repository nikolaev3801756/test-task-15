import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { ScaleControlComponent } from '../scale-control/scale-control.component';
import { ApiService } from '../../services';
import { AnnotationDto, DocumentDto, SaveDocumentDto } from '../../models';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import {
  NzLayoutComponent,
  NzHeaderComponent,
  NzContentComponent,
} from 'ng-zorro-antd/layout';

@Component({
  selector: 'tt-viewer-view',
  imports: [
    DocumentComponent,
    ScaleControlComponent,
    NzSpinComponent,
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent {
  private readonly apiService = inject(ApiService);

  protected readonly documentScale = signal<number>(1);
  protected readonly document: Signal<DocumentDto | null>;
  protected readonly loadingDocument: Signal<boolean>;

  protected readonly title: Signal<string | null>;

  constructor() {
    const getDocumentRecource = this.apiService.getDocument('1');

    this.document = getDocumentRecource.value;
    this.loadingDocument = getDocumentRecource.isLoading;

    this.title = computed(() => this.document()?.name ?? null);
  }

  onSave(annotations: AnnotationDto[]): void {
    const document = this.document();

    if (document !== null) {
      this.apiService.saveDocument({ ...document, annotations });
    }
  }
}
