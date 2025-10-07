import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  outputBinding,
  signal,
  Signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { AnnotationDto, DocumentDto, Size } from '../../models';
import { AnnotationComponent } from '../annotation/annotation.component';
import { nameof } from 'ts-simple-nameof';
import { v4 as createId } from 'uuid';
import { NzButtonComponent } from 'ng-zorro-antd/button';

type ImgContainersSize = Record<number, Size>;

const PADDING = 16;

@Component({
  selector: 'tt-viewer-document',
  imports: [NzButtonComponent],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentComponent {
  scale = input<number>(1);
  document = input.required<DocumentDto | null>();

  save = output<AnnotationDto[]>();

  private imgContainersInitialSize = signal<ImgContainersSize>({});

  protected readonly imgContainersSize: Signal<ImgContainersSize>;

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  private annotationContainerRef = viewChild('annotationContainer', {
    read: ViewContainerRef,
  });

  private annotationComponetRefs: Record<
    string,
    ComponentRef<AnnotationComponent>
  > = {};

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

    effect(() => {
      const scale = this.scale();

      for (const key in this.annotationComponetRefs) {
        const annotationRef = this.annotationComponetRefs[key];

        annotationRef.setInput(
          nameof<AnnotationComponent>((x) => x.offset),
          scale,
        );
      }
    });
  }

  onSave(): void {
    const result: AnnotationDto[] = [];

    for (const key in this.annotationComponetRefs) {
      const element = this.annotationComponetRefs[key];
      const text = element.instance.text();
      if (!text) {
        continue;
      }

      const point = element.instance.point();
      result.push({ x: point.x, y: point.y, text: text });
    }

    this.save.emit(result);
  }

  protected imgInit(pageNumber: number, height: number, width: number) {
    const maxWidth = this.elementRef.nativeElement.offsetWidth - PADDING * 2;

    if (width > maxWidth) {
      height = height * (maxWidth / width);
      width = maxWidth;
    }

    this.imgContainersInitialSize.update((value) => {
      const result = { ...value };
      result[pageNumber] = { height, width };
      return result;
    });
  }

  protected createAnnotation(event: PointerEvent): void {
    const id = createId();

    const componentRef = this.annotationContainerRef()?.createComponent(
      AnnotationComponent,
      {
        bindings: [
          outputBinding(
            nameof<AnnotationComponent>((x) => x.delete),
            this.deleteAnnotation(id),
          ),
        ],
      },
    );

    if (componentRef !== undefined) {
      const scale = this.scale();

      componentRef.setInput(
        nameof<AnnotationComponent>((x) => x.startPoint),
        { x: event.layerX / scale, y: event.layerY / scale },
      );

      componentRef.setInput(
        nameof<AnnotationComponent>((x) => x.offset),
        this.scale(),
      );

      this.annotationComponetRefs[id] = componentRef;
    }
  }

  private deleteAnnotation(id: string): () => void {
    return () => {
      this.annotationComponetRefs[id].destroy();

      delete this.annotationComponetRefs[id];
    };
  }
}
