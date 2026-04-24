import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <div class="max-w-md w-full">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">AgriSmart</h1>
          <p class="text-gray-600 mt-2">Create your account</p>
        </div>

        <!-- Register Form -->
        <div class="card">
          @if (error) {
            <div class="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
              {{ error }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="label">Full Name</label>
              <input 
                type="text" 
                class="input" 
                [(ngModel)]="name" 
                name="name" 
                placeholder="Enter your full name"
                required
              >
            </div>

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

            <div class="mb-4">
              <label class="label">Password</label>
              <input 
                type="password" 
                class="input" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="Create a password (min 6 characters)"
                required
                minlength="6"
              >
            </div>

            <div class="mb-4">
              <label class="label">Phone Number</label>
              <input 
                type="tel" 
                class="input" 
                [(ngModel)]="phone" 
                name="phone" 
                placeholder="+1234567890"
              >
            </div>

            <div class="mb-4">
              <label class="label">Location</label>
              <input 
                type="text" 
                class="input" 
                [(ngModel)]="location" 
                name="location" 
                placeholder="Your location"
              >
            </div>

            <div class="mb-6">
              <label class="label">Account Type</label>
              <select class="input" [(ngModel)]="role" name="role">
                <option value="farmer">Farmer</option>
                <option value="admin">Agri-Consultant (Admin)</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                @if (role === 'farmer') {
                  As a farmer, you'll manage your crops and tasks.
                } @else {
                  As an Agri-Consultant, you'll manage farmers and create crop schedules.
                }
              </p>
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
                  Creating account...
                </span>
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <a routerLink="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  phone = '';
  location = '';
  role = 'farmer';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone || undefined,
      location: this.location || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}