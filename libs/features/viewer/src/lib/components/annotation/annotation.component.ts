import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnInit,
  output,
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
  },
})
export class AnnotationComponent implements OnInit {
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
  }

  point = input.required<Point>();
  offset = input.required<number>();

  delete = output();

  protected inputElement =
    viewChild<ElementRef<HTMLInputElement>>('inputElement');
  protected containerElement =
    viewChild<ElementRef<HTMLInputElement>>('containerElement');
  protected text = model<string>();
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

    const parentElementRect =
      this.elementRef.nativeElement.parentElement!.getClientRects()[0];
    const offset = this.offset();

    this.parentElementOriginalSize = {
      width: parentElementRect.width / offset,
      height: parentElementRect.height / offset,
    };
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
}
