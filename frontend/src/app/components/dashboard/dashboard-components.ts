import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Admins</h1><p class="text-gray-600">Admin management coming soon</p></div>`
})
export class AdminListComponent {}

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Subscriptions</h1><p class="text-gray-600">Subscription management coming soon</p></div>`
})
export class SubscriptionListComponent {}

@Component({
  selector: 'app-farmer-list',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Farmers</h1><p class="text-gray-600">Farmer management coming soon</p></div>`
})
export class FarmerListComponent {}

@Component({
  selector: 'app-crop-management',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Crop Management</h1><p class="text-gray-600">Crop management coming soon</p></div>`
})
export class CropManagementComponent {}

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Schedule Management</h1><p class="text-gray-600">Schedule management coming soon</p></div>`
})
export class ScheduleManagementComponent {}

@Component({
  selector: 'app-task-overview',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Task Overview</h1><p class="text-gray-600">Task overview coming soon</p></div>`
})
export class TaskOverviewComponent {}

@Component({
  selector: 'app-weather-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8"><h1 class="text-2xl font-bold">Weather Alerts</h1><p class="text-gray-600">Weather alerts coming soon</p></div>`
})
export class WeatherAlertsComponent {}

@Component({
  selector: 'app-farmer-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h1 class="text-xl font-bold">My Tasks</h1><p class="text-gray-600">Task list coming soon</p></div>`
})
export class FarmerTasksComponent {}

@Component({
  selector: 'app-farmer-crops',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h1 class="text-xl font-bold">My Crops</h1><p class="text-gray-600">Crop list coming soon</p></div>`
})
export class FarmerCropsComponent {}

@Component({
  selector: 'app-farmer-weather',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h1 class="text-xl font-bold">Weather</h1><p class="text-gray-600">Weather info coming soon</p></div>`
})
export class FarmerWeatherComponent {}

@Component({
  selector: 'app-farmer-profile',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h1 class="text-xl font-bold">Profile</h1><p class="text-gray-600">Profile settings coming soon</p></div>`
})
export class FarmerProfileComponent {}