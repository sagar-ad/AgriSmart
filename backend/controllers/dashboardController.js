const User = require('../models/User');
const Subscription = require('../models/Subscription');
const FarmerTask = require('../models/FarmerTask');
const db = require('../config/database');

/**
 * Dashboard Controller
 * Provides role-specific dashboard data
 */
class DashboardController {
  /**
   * GET /api/dashboard/super-admin
   * Super Admin dashboard metrics
   */
  static async getSuperAdminDashboard(req, res, next) {
    try {
      // Get user counts by role
      const userCounts = await User.getCountByRole();
      
      // Get plan distribution
      const planDistribution = await Subscription.getPlanDistribution();
      
      // Get active subscriptions count
      const activeSubscriptions = await Subscription.getActiveCount();
      
      // Get all subscriptions for revenue calculation
      const subscriptions = await Subscription.getAllActive();
      
      // Calculate revenue (simplified - just counting active subs)
      const revenue = subscriptions.reduce((total, sub) => {
        const planPrices = { free: 0, basic: 100, premium: 500 };
        return total + (planPrices[sub.plan_type] || 0);
      }, 0);
      
      // Format response
      const totalAdmins = userCounts.find(u => u.role === 'admin')?.count || 0;
      const totalFarmers = userCounts.find(u => u.role === 'farmer')?.count || 0;
      const totalUsers = totalAdmins + totalFarmers + 1; // +1 for super admin
      
      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalAdmins,
          totalFarmers,
          activeSubscriptions,
          planDistribution: planDistribution.map(p => ({
            plan: p.plan_type,
            count: parseInt(p.count)
          })),
          revenue: {
            monthly: revenue,
            currency: 'USD'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/admin
   * Admin (Agri-Consultant) dashboard metrics
   */
  static async getAdminDashboard(req, res, next) {
    try {
      const adminId = req.user.id;
      
      // Get total farmers
      const farmersResult = await db.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'farmer'"
      );
      const totalFarmers = parseInt(farmersResult.rows[0].count);
      
      // Get task compliance across all farmers
      const complianceResult = await db.query(
        `SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN ft.status = 'done' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN ft.status = 'pending' AND ft.due_date < CURRENT_DATE THEN 1 END) as overdue_tasks
         FROM farmer_tasks ft
         JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id`
      );
      
      const totalTasks = parseInt(complianceResult.rows[0].total_tasks || 0);
      const completedTasks = parseInt(complianceResult.rows[0].completed_tasks || 0);
      const overdueTasks = parseInt(complianceResult.rows[0].overdue_tasks || 0);
      
      // Get upcoming tasks (next 7 days)
      const upcomingTasksResult = await db.query(
        `SELECT ft.*, u.name as farmer_name, c.name as crop_name
         FROM farmer_tasks ft
         JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
         JOIN users u ON fc.farmer_id = u.id
         JOIN crops c ON fc.crop_id = c.id
         WHERE ft.status = 'pending' 
           AND ft.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
         ORDER BY ft.due_date
         LIMIT 10`
      );
      
      // Get recent farmers
      const recentFarmersResult = await db.query(
        `SELECT id, name, phone, location, created_at
         FROM users
         WHERE role = 'farmer'
         ORDER BY created_at DESC
         LIMIT 5`
      );
      
      const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      return res.status(200).json({
        success: true,
        data: {
          totalFarmers,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            pending: totalTasks - completedTasks,
            overdue: overdueTasks,
            completionRate
          },
          upcomingTasks: upcomingTasksResult.rows,
          recentFarmers: recentFarmersResult.rows
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/farmer
   * Farmer dashboard metrics
   */
  static async getFarmerDashboard(req, res, next) {
    try {
      const farmerId = req.user.id;
      
      // Get compliance stats
      const stats = await FarmerTask.getComplianceStats(farmerId);
      
      // Get today's tasks
      const todaysTasks = await FarmerTask.getTodaysTasks(farmerId);
      
      // Get pending tasks
      const pendingTasks = await FarmerTask.getPendingTasks(farmerId);
      
      // Get farmer crops with progress
      const cropsResult = await db.query(
        `SELECT fc.*, c.name as crop_name, c.variety as crop_variety,
                COUNT(ft.id) as total_tasks,
                COUNT(CASE WHEN ft.status = 'done' THEN 1 END) as completed_tasks
         FROM farmer_crops fc
         JOIN crops c ON fc.crop_id = c.id
         LEFT JOIN farmer_tasks ft ON fc.id = ft.farmer_crop_id
         WHERE fc.farmer_id = $1
         GROUP BY fc.id
         ORDER BY fc.created_at DESC`,
        [farmerId]
      );
      
      const crops = cropsResult.rows.map(crop => ({
        ...crop,
        progress: crop.total_tasks > 0 
          ? Math.round((crop.completed_tasks / crop.total_tasks) * 100) 
          : 0
      }));
      
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalTasks: parseInt(stats.total_tasks || 0),
            completedTasks: parseInt(stats.completed_tasks || 0),
            overdueTasks: parseInt(stats.overdue_tasks || 0),
            todaysTasks: todaysTasks.length,
            completionRate: parseFloat(stats.completion_rate || 0)
          },
          todaysTasks,
          pendingTasks: pendingTasks.slice(0, 10), // Top 10 pending
          crops
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;