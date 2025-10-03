import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  output,
  Output,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import Decimal from 'decimal.js';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { MAX_SCALE, MIN_SCALE, SCALE_STEP } from '../../constants';

@Component({
  selector: 'tt-viewer-scale-control',
  imports: [NzButtonComponent, NzIconDirective],
  templateUrl: './scale-control.component.html',
  styleUrl: './scale-control.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleControlComponent {
  readonly valueChange = output<number>();

  protected readonly scale = signal<number>(1);
  protected readonly scalePercent: Signal<number>;

  constructor() {
    this.scalePercent = computed(() =>
      Decimal.mul(this.scale(), 100).toNumber(),
    );
  }

  increaseScale(): void {
    this.scale.update((value) => {
      if (value >= MAX_SCALE) {
        return MAX_SCALE;
      }

      return Decimal.add(value, SCALE_STEP).toNumber();
    });
  }

  decreaseScale(): void {
    this.scale.update((value) => {
      if (value <= MIN_SCALE) {
        return MIN_SCALE;
      }

      return Decimal.sub(value, SCALE_STEP).toNumber();
    });
  }

  save(): void {
    this.valueChange.emit(this.scale());
  }
}
