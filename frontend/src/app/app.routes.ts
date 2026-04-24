import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'super-admin',
    loadComponent: () => import('./components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/super-admin-dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent)
      },
      { 
        path: 'admins', 
        loadComponent: () => import('./components/dashboard/admin-list/admin-list.component').then(m => m.AdminListComponent)
      },
      { 
        path: 'subscriptions', 
        loadComponent: () => import('./components/dashboard/subscription-list/subscription-list.component').then(m => m.SubscriptionListComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      { 
        path: 'farmers', 
        loadComponent: () => import('./components/dashboard/farmer-list/farmer-list.component').then(m => m.FarmerListComponent)
      },
      { 
        path: 'crops', 
        loadComponent: () => import('./components/dashboard/crop-management/crop-management.component').then(m => m.CropManagementComponent)
      },
      { 
        path: 'schedules', 
        loadComponent: () => import('./components/dashboard/schedule-management/schedule-management.component').then(m => m.ScheduleManagementComponent)
      },
      { 
        path: 'tasks', 
        loadComponent: () => import('./components/dashboard/task-overview/task-overview.component').then(m => m.TaskOverviewComponent)
      },
      { 
        path: 'weather', 
        loadComponent: () => import('./components/dashboard/weather-alerts/weather-alerts.component').then(m => m.WeatherAlertsComponent)
      }
    ]
  },
  {
    path: 'farmer',
    loadComponent: () => import('./components/layout/mobile-layout/mobile-layout.component').then(m => m.MobileLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['farmer'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/farmer-dashboard/farmer-dashboard.component').then(m => m.FarmerDashboardComponent)
      },
      { 
        path: 'tasks', 
        loadComponent: () => import('./components/dashboard/farmer-tasks/farmer-tasks.component').then(m => m.FarmerTasksComponent)
      },
      { 
        path: 'crops', 
        loadComponent: () => import('./components/dashboard/farmer-crops/farmer-crops.component').then(m => m.FarmerCropsComponent)
      },
      { 
        path: 'weather', 
        loadComponent: () => import('./components/dashboard/farmer-weather/farmer-weather.component').then(m => m.FarmerWeatherComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./components/dashboard/farmer-profile/farmer-profile.component').then(m => m.FarmerProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];