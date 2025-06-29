import {Routes} from '@angular/router';
import {AuthGuard} from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
 //   canActivate: [AuthGuard],
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
   // canActivate: [AuthGuard],
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'industries',
   // canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/industries/industries.component').then((m) => m.IndustriesComponent),
  },
  {
    path: 'products',
  //  canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'projects',
   // canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'contact',
 //   canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
