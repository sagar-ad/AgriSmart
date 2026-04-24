const db = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { email, password, role, name, phone, location } = userData;
    const hashedPassword = await hashPassword(password);
    
    const result = await db.query(
      `INSERT INTO users (email, password, role, name, phone, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, name, phone, location, is_active, created_at`,
      [email, hashedPassword, role, name, phone || null, location || null]
    );
    
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, role, name, phone, location, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(password, hashedPassword) {
    return await comparePassword(password, hashedPassword);
  }

  /**
   * Get all users by role
   */
  static async findByRole(role) {
    const result = await db.query(
      'SELECT id, email, role, name, phone, location, is_active, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      [role]
    );
    return result.rows;
  }

  /**
   * Get all admins (for Super Admin)
   */
  static async getAllAdmins() {
    const result = await db.query(
      `SELECT u.id, u.email, u.role, u.name, u.phone, u.location, u.is_active, u.created_at,
              s.plan_type, s.start_date, s.end_date
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.admin_id AND s.end_date >= CURRENT_DATE
       WHERE u.role = 'admin'
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get all farmers (for Admin)
   */
  static async getAllFarmers(adminId) {
    // Get all farmers managed by this admin (in a real app, you'd have a mapping)
    const result = await db.query(
      `SELECT id, email, role, name, phone, location, is_active, created_at 
       FROM users 
       WHERE role = 'farmer' 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get farmers with their task compliance
   */
  static async getFarmersWithCompliance(adminId) {
    const result = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.location, u.created_at,
        COUNT(ft.id) as total_tasks,
        COUNT(CASE WHEN ft.status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN ft.status = 'pending' AND ft.due_date < CURRENT_DATE THEN 1 END) as overdue_tasks
       FROM users u
       LEFT JOIN farmer_crops fc ON u.id = fc.farmer_id
       LEFT JOIN farmer_tasks ft ON fc.id = ft.farmer_crop_id
       WHERE u.role = 'farmer'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Update user
   */
  static async update(id, userData) {
    const { name, phone, location, is_active } = userData;
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           location = COALESCE($3, location),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, role, name, phone, location, is_active, updated_at`,
      [name, phone, location, is_active, id]
    );
    return result.rows[0];
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivate(id) {
    const result = await db.query(
      `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING id, email, role, name, is_active`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get user count by role (for Super Admin dashboard)
   */
  static async getCountByRole() {
    const result = await db.query(
      `SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role`
    );
    return result.rows;
  }
}

module.exports = User;