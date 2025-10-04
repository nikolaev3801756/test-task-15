import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  Signal,
  ViewEncapsulation,
} from '@angular/core';
import { DocumentDto } from '../../models';

interface Size {
  readonly width: number;
  readonly height: number;
}

type ImgContainersSize = { [key: number]: Size };

@Component({
  selector: 'tt-viewer-document',
  imports: [],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent {
  scale = input<number>(1);
  document = input.required<DocumentDto | null>();

  private imgContainersInitialSize = signal<ImgContainersSize>({});

  protected readonly imgContainersSize: Signal<ImgContainersSize>;

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    this.imgContainersSize = computed(() => {
      const scale = this.scale();
      const imgContainersInitialSize = this.imgContainersInitialSize();

      const result = Object.keys(imgContainersInitialSize).reduce(
        (acc, value) => {
          acc[+value] = {
            height: imgContainersInitialSize[+value].height * scale,
            width: imgContainersInitialSize[+value].width * scale,
          };
          return acc;
        },
        {} as ImgContainersSize,
      );

      return result;
    });
  }

  protected imgInit(pageNumber: number, height: number, width: number) {
    if (width > this.elementRef.nativeElement.offsetWidth) {
      height = height * (this.elementRef.nativeElement.offsetWidth / width);
      width = this.elementRef.nativeElement.offsetWidth;
    }

    this.imgContainersInitialSize.update((value) => {
      const result = { ...value };
      result[pageNumber] = { height, width };
      return result;
    });
  }
}
