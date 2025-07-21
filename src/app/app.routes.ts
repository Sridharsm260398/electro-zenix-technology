import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard'; // update path as needed

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'industries',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/industries/industries.component').then(
        (m) => m.IndustriesComponent
      ),
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductsComponent
      ),
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/projects/projects.component').then(
        (m) => m.ProjectsComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./components/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent
          ),
      },
      {
        path: 'invoice',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./components/invoice/invoice.component').then(
            (m) => m.InvoiceComponent
          ),
      },
      {
        path: 'invoice-list',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import(
            './components/invoice/invoice-list/invoice-list.component'
          ).then((m) => m.InvoiceListComponent),
      },
      {
        path: 'invoice/edit/:id',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import(
            './components/invoice/invoice-edit/invoice-edit.component'
          ).then((m) => m.InvoiceEditComponent),
      },
      {
        path: 'invoice/view/:id',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import(
            './components/invoice/invoice-view/invoice-view.component'
          ).then((m) => m.InvoiceViewComponent),
      },
      {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }, // only admins can access
        loadComponent: () =>
          import('./components/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
      },
    ],
  },

  // fallback
  {
    path: '**',
    redirectTo: '',
  },
];
