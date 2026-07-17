import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth.guard';
import { LoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminCrudComponent } from './shared/admin-crud.component';
import { MessagesComponent } from './messages/messages.component';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';
import {
  EDUCATION_CRUD,
  EXPERIENCE_CRUD,
  PROJECTS_CRUD,
  SKILLS_CRUD,
  SOCIAL_LINKS_CRUD,
} from './shared/crud-config';

export const ADMIN_ROUTES: Routes = [
  { path: 'login', component: LoginComponent, title: 'Admin Login' },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'messages', pathMatch: 'full' },
      { path: 'messages', component: MessagesComponent, title: 'Messages | Admin' },
      { path: 'profile', component: ProfileEditorComponent, title: 'Profile | Admin' },
      { path: 'projects', component: AdminCrudComponent, data: { config: PROJECTS_CRUD }, title: 'Projects | Admin' },
      { path: 'experience', component: AdminCrudComponent, data: { config: EXPERIENCE_CRUD }, title: 'Experience | Admin' },
      { path: 'education', component: AdminCrudComponent, data: { config: EDUCATION_CRUD }, title: 'Education | Admin' },
      { path: 'skills', component: AdminCrudComponent, data: { config: SKILLS_CRUD }, title: 'Skills | Admin' },
      { path: 'social-links', component: AdminCrudComponent, data: { config: SOCIAL_LINKS_CRUD }, title: 'Social Links | Admin' },
    ],
  },
];
