import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasRole(requiredRoles)) {
    return true;
  }

  // Redirect to appropriate dashboard based on current role
  const userRole = authService.userRole();
  if (userRole === 'super_admin') {
    router.navigate(['/super-admin']);
  } else if (userRole === 'admin') {
    router.navigate(['/admin']);
  } else if (userRole === 'farmer') {
    router.navigate(['/farmer']);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};