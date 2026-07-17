import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), title: 'Md Zakaria Masud — Senior Software Engineer' },
  { path: 'work', loadComponent: () => import('./pages/work/work.component').then(m => m.WorkComponent), title: 'Projects | Md Zakaria Masud' },
  { path: 'resume', loadComponent: () => import('./pages/resume/resume.component').then(m => m.ResumeComponent), title: 'Resume | Md Zakaria Masud' },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent), title: 'Contact | Md Zakaria Masud' },
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '**', redirectTo: '' }
];
