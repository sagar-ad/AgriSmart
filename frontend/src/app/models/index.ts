export interface User {
  id: number;
  email: string;
  role: 'super_admin' | 'admin' | 'farmer';
  name: string;
  phone?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface Crop {
  id: number;
  name: string;
  variety?: string;
  description?: string;
  created_at: string;
  template_count?: number;
}

export interface ScheduleTemplate {
  id: number;
  crop_id: number;
  crop_name?: string;
  task_name: string;
  days_after_sowing: number;
  instructions?: string;
  created_at: string;
}

export interface FarmerCrop {
  id: number;
  farmer_id: number;
  crop_id: number;
  crop_name: string;
  crop_variety?: string;
  sowing_date: string;
  created_at: string;
  tasks?: FarmerTask[];
}

export interface FarmerTask {
  id: number;
  farmer_crop_id: number;
  task_name: string;
  due_date: string;
  das: number;
  instructions?: string;
  status: 'pending' | 'done';
  completed_at?: string;
  completion_note?: string;
  completion_photo?: string;
  created_at: string;
  crop_name?: string;
  farmer_id?: number;
}

export interface WeatherAlert {
  id: number;
  farmer_id: number;
  alert_type: 'rain' | 'heat' | 'flood' | 'drought';
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  admin_id: number;
  plan_type: 'free' | 'basic' | 'premium';
  start_date: string;
  end_date: string;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalAdmins?: number;
  totalFarmers?: number;
  activeSubscriptions?: number;
  planDistribution?: { plan: string; count: number }[];
  revenue?: { monthly: number; currency: string };
  totalFarmers?: number;
  taskStats?: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  stats?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    todaysTasks: number;
    completionRate: number;
  };
  todaysTasks?: FarmerTask[];
  pendingTasks?: FarmerTask[];
  crops?: FarmerCrop[];
  upcomingTasks?: FarmerTask[];
  recentFarmers?: User[];
}