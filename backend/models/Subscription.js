const db = require('../config/database');

class Subscription {
  /**
   * Create a new subscription
   */
  static async create(subscriptionData) {
    const { admin_id, plan_type, start_date, end_date } = subscriptionData;
    const result = await db.query(
      `INSERT INTO subscriptions (admin_id, plan_type, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [admin_id, plan_type, start_date, end_date]
    );
    return result.rows[0];
  }

  /**
   * Get subscription by admin ID
   */
  static async findByAdminId(adminId) {
    const result = await db.query(
      `SELECT * FROM subscriptions 
       WHERE admin_id = $1 AND end_date >= CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [adminId]
    );
    return result.rows[0];
  }

  /**
   * Get all active subscriptions
   */
  static async getAllActive() {
    const result = await db.query(
      `SELECT s.*, u.name as admin_name, u.email as admin_email
       FROM subscriptions s
       JOIN users u ON s.admin_id = u.id
       WHERE s.end_date >= CURRENT_DATE
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get all subscriptions
   */
  static async getAll() {
    const result = await db.query(
      `SELECT s.*, u.name as admin_name, u.email as admin_email
       FROM subscriptions s
       JOIN users u ON s.admin_id = u.id
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Update subscription
   */
  static async update(id, subscriptionData) {
    const { plan_type, start_date, end_date } = subscriptionData;
    const result = await db.query(
      `UPDATE subscriptions 
       SET plan_type = COALESCE($1, plan_type),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date)
       WHERE id = $4
       RETURNING *`,
      [plan_type, start_date, end_date, id]
    );
    return result.rows[0];
  }

  /**
   * Get subscription stats for Super Admin dashboard
   */
  static async getPlanDistribution() {
    const result = await db.query(
      `SELECT plan_type, COUNT(*) as count
       FROM subscriptions
       WHERE end_date >= CURRENT_DATE
       GROUP BY plan_type`
    );
    return result.rows;
  }

  /**
   * Get active subscription count
   */
  static async getActiveCount() {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE end_date >= CURRENT_DATE`
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Subscription;