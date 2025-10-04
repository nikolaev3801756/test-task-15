import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  outputBinding,
  signal,
  Signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DocumentDto, Size } from '../../models';
import { AnnotationComponent } from '../annotation/annotation.component';
import { nameof } from 'ts-simple-nameof';
import { v4 as createId } from 'uuid';

type ImgContainersSize = Record<number, Size>;

const PADDING = 16;

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

  createAnnotation(event: PointerEvent): void {
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
        nameof<AnnotationComponent>((x) => x.point),
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
    };
  }
}
