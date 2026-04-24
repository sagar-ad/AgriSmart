const db = require('../config/database');

class WeatherAlert {
  /**
   * Create a new weather alert
   */
  static async create(alertData) {
    const { farmer_id, alert_type, message, severity } = alertData;
    const result = await db.query(
      `INSERT INTO weather_alerts (farmer_id, alert_type, message, severity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farmer_id, alert_type, message, severity]
    );
    return result.rows[0];
  }

  /**
   * Get alerts by farmer ID
   */
  static async findByFarmerId(farmerId) {
    const result = await db.query(
      `SELECT * FROM weather_alerts 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get unread alerts for farmer
   */
  static async getUnreadAlerts(farmerId) {
    const result = await db.query(
      `SELECT * FROM weather_alerts 
       WHERE farmer_id = $1 AND is_read = false 
       ORDER BY created_at DESC`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Mark alert as read
   */
  static async markAsRead(id) {
    const result = await db.query(
      `UPDATE weather_alerts SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Mark all alerts as read for farmer
   */
  static async markAllAsRead(farmerId) {
    const result = await db.query(
      `UPDATE weather_alerts SET is_read = true WHERE farmer_id = $1 RETURNING *`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get unread count for farmer
   */
  static async getUnreadCount(farmerId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM weather_alerts 
       WHERE farmer_id = $1 AND is_read = false`,
      [farmerId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Delete old alerts (cleanup)
   */
  static async deleteOlderThan(days) {
    const result = await db.query(
      `DELETE FROM weather_alerts 
       WHERE created_at < NOW() - INTERVAL '${days} days' 
       RETURNING id`
    );
    return result.rows;
  }
}

module.exports = WeatherAlert;