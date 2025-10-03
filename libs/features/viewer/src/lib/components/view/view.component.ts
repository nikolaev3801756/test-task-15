import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ScaleControlComponent } from '../scale-control/scale-control.component';
import {
  NzLayoutComponent,
  NzHeaderComponent,
  NzContentComponent,
} from 'ng-zorro-antd/layout';

@Component({
  selector: 'tt-viewer-view',
  imports: [
    ScaleControlComponent,
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
  protected readonly documentScale = signal<number>(1);
}
