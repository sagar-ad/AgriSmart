import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div class="max-w-md w-full">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">AgriSmart</h1>
          <p class="text-gray-600 mt-2">Agri-Tech Management System</p>
        </div>

        <!-- Login Form -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>
          
          @if (error) {
            <div class="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
              {{ error }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="label">Email Address</label>
              <input 
                type="email" 
                class="input" 
                [(ngModel)]="email" 
                name="email" 
                placeholder="Enter your email"
                required
                email
              >
            </div>

            <div class="mb-6">
              <label class="label">Password</label>
              <input 
                type="password" 
                class="input" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="Enter your password"
                required
              >
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full py-3"
              [disabled]="loading"
            >
              @if (loading) {
                <span class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <a routerLink="/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </a>
            </p>
          </div>
        </div>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-white/50 rounded-lg">
          <p class="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
          <div class="text-xs text-gray-500 space-y-1">
            <p>Super Admin: superadmin&#64;agrismart.com</p>
            <p>Admin: admin1&#64;agrismart.com</p>
            <p>Farmer: farmer1&#64;agrismart.com</p>
            <p class="text-gray-400 mt-1">Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}