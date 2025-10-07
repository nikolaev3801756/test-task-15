import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  Signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Point, Size } from '../../models';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

interface Direction {
  readonly x: 'left' | 'right';
  readonly y: 'top' | 'bottom';
}

interface Position {
  readonly top: string;
  readonly left: string;
  readonly right: string;
  readonly bottom: string;
}

@Component({
  selector: 'tt-viewer-annotation',
  imports: [NzButtonComponent, NzIconDirective, FormsModule, NgClass],
  templateUrl: './annotation.component.html',
  styleUrl: './annotation.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.left]': 'position().left',
    '[style.right]': 'position().right',
    '[style.top]': 'position().top',
    '[style.bottom]': 'position().bottom',
    '[class.dragging]': 'isDragging()',
  },
})
export class AnnotationComponent implements OnInit, OnDestroy {
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: Event): void {
    event.stopPropagation();
    this.isDragging.set(true);

    const parentElement = this.elementRef.nativeElement.parentElement!;

    parentElement.addEventListener('mousemove', this.onParentMouseMove);
    parentElement.addEventListener('mouseup', this.onParentMouseUp);
  }

  startPoint = input.required<Point>();
  pointChange = output<Point>();

  offset = input.required<number>();

  delete = output();

  point = signal<Point>({ x: 0, y: 0 });
  text = model<string>();
  protected isDragging = signal<boolean>(false);
  protected inputElement =
    viewChild<ElementRef<HTMLInputElement>>('inputElement');
  protected containerElement =
    viewChild<ElementRef<HTMLInputElement>>('containerElement');
  protected coordinates: Signal<Point>;
  protected direction: Signal<Direction>;
  protected position: Signal<Position>;
  private parentElementOriginalSize: Size = { width: 0, height: 0 };

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  onDelete(event: Event): void {
    this.delete.emit();
    event.stopPropagation();
  }

  constructor() {
    effect(() => {
      this.point.set(this.startPoint());
    });

    this.coordinates = computed(() => {
      const point = this.point();
      const offset = this.offset();

      return { x: point.x * offset, y: point.y * offset };
    });

    this.direction = computed(() => {
      const coordinates = this.coordinates();
      const offset = this.offset();

      const element = this.elementRef.nativeElement;
      const parentElementSize = {
        width: this.parentElementOriginalSize.width * offset,
        height: this.parentElementOriginalSize.height * offset,
      };

      this.inputElement()?.nativeElement.getClientRects();
      const elementRect = element.getClientRects()[0];

      let directionX: 'left' | 'right' = 'left';

      if (
        parentElementSize.width - elementRect.width <
        coordinates.x + elementRect.width
      ) {
        directionX = 'right';
      }

      let directionY: 'top' | 'bottom' = 'top';

      if (
        parentElementSize.height - elementRect.height <
        coordinates.y + elementRect.height
      ) {
        directionY = 'bottom';
      } else {
        directionY = 'top';
      }

      return { x: directionX, y: directionY };
    });

    this.position = computed(() => {
      const coordinates = this.coordinates();
      const offset = this.offset();

      const element = this.elementRef.nativeElement;
      const parentElementSize = {
        width: this.parentElementOriginalSize.width * offset,
        height: this.parentElementOriginalSize.height * offset,
      };

      this.inputElement()?.nativeElement.getClientRects();
      const elementRect = element.getClientRects()[0];

      let left = 'auto';
      let right = 'auto';

      if (
        parentElementSize.width - elementRect.width <
        coordinates.x + elementRect.width
      ) {
        right = parentElementSize.width - coordinates.x + 'px';
      } else {
        left = coordinates.x + 'px';
      }

      let top = 'auto';
      let bottom = 'auto';

      if (
        parentElementSize.height - elementRect.height <
        coordinates.y + elementRect.height
      ) {
        bottom = parentElementSize.height - coordinates.y + 'px';
      } else {
        top = coordinates.y + 'px';
      }

      return { left, right, top, bottom };
    });
  }

  ngOnInit(): void {
    this.inputFocus();

    const parentElement = this.elementRef.nativeElement.parentElement!;
    const parentElementRect = parentElement.getClientRects()[0];
    const offset = this.offset();

    this.parentElementOriginalSize = {
      width: parentElementRect.width / offset,
      height: parentElementRect.height / offset,
    };
  }

  ngOnDestroy(): void {
    const parentElement = this.elementRef.nativeElement.parentElement;
    parentElement?.removeEventListener('mousemove', this.onParentMouseMove);
    parentElement?.removeEventListener('mouseup', this.onParentMouseUp);
  }

  protected inputFocus(): void {
    setTimeout(() => {
      this.inputElement()?.nativeElement.focus();
    });
  }

  protected onInputBlur(): void {
    if (!this.text()) {
      this.delete.emit();
    }
  }

  private onParentMouseUp = (event: any): void => {
    this.isDragging.set(false);

    const parentElement = this.elementRef.nativeElement.parentElement!;
    parentElement.removeEventListener('mousemove', this.onParentMouseMove);
    parentElement.removeEventListener('mouseup', this.onParentMouseUp);
  };

  private onParentMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging()) {
      return;
    }

    const element = this.elementRef.nativeElement;
    const parentElement = element.parentElement!;

    const parentClientRects = parentElement.getClientRects()[0];

    let x = event.clientX / this.offset() - parentClientRects.x / this.offset();
    let y = event.clientY / this.offset() - parentClientRects.y / this.offset();

    x = Math.max(
      0,
      Math.min(x, this.parentElementOriginalSize.width * this.offset()),
    );
    y = Math.max(
      0,
      Math.min(y, this.parentElementOriginalSize.height * this.offset()),
    );

    this.point.set({ x: x, y: y });
    this.pointChange.emit({ x: x, y: y });
  };
}
