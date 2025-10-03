import { Route } from '@angular/router';
import { ViewComponent, MainComponent } from './components';

export const VIEWER_ROUTES: Route[] = [
  { path: '', component: MainComponent },
  { path: 'view/:id', component: ViewComponent },
];
