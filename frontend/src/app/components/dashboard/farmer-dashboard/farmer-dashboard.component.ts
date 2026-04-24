import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats } from '../../models';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 class="text-xl font-bold mb-1">Welcome back!</h1>
        <p class="text-primary-100 text-sm">Here's your farm overview</p>
      </div>

      @if (loading) {
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else if (stats) {
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <p class="text-xs text-gray-500">Today's Tasks</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.stats?.todaysTasks }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <p class="text-xs text-gray-500">Pending</p>
            <p class="text-2xl font-bold text-warning-600">{{ (stats.stats?.totalTasks || 0) - (stats.stats?.completedTasks || 0) }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <p class="text-xs text-gray-500">Completed</p>
            <p class="text-2xl font-bold text-success-600">{{ stats.stats?.completedTasks }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <p class="text-xs text-gray-500">Overdue</p>
            <p class="text-2xl font-bold text-danger-600">{{ stats.stats?.overdueTasks }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Completion Rate</span>
            <span class="text-sm font-bold text-primary-600">{{ stats.stats?.completionRate }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-primary-600 h-2 rounded-full" [style.width.%]="stats.stats?.completionRate"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class FarmerDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/dashboard/farmer').subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}