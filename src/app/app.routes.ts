import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'viewer',
    loadChildren: () =>
      import('@test-task/viewer').then((r) => r.VIEWER_ROUTES),
  },
];
