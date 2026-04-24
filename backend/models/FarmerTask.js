const db = require('../config/database');

class FarmerTask {
  /**
   * Create a new task
   */
  static async create(taskData) {
    const { farmer_crop_id, task_name, due_date, das, instructions } = taskData;
    const result = await db.query(
      `INSERT INTO farmer_tasks (farmer_crop_id, task_name, due_date, das, instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [farmer_crop_id, task_name, due_date, das, instructions || null]
    );
    return result.rows[0];
  }

  /**
   * Bulk create tasks (for schedule generation)
   */
  static async bulkCreate(tasks) {
    if (!tasks || tasks.length === 0) return [];
    
    const values = tasks.map(t => 
      `(${t.farmer_crop_id}, '${t.task_name}', '${t.due_date}', ${t.das}, ${t.instructions ? `'${t.instructions.replace(/'/g, "''")}'` : 'NULL'})`
    ).join(',');
    
    const result = await db.query(
      `INSERT INTO farmer_tasks (farmer_crop_id, task_name, due_date, das, instructions)
       VALUES ${values}
       RETURNING *`
    );
    return result.rows;
  }

  /**
   * Get tasks by farmer crop ID
   */
  static async findByFarmerCropId(farmerCropId) {
    const result = await db.query(
      `SELECT ft.*, fc.farmer_id, fc.sowing_date
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       WHERE ft.farmer_crop_id = $1
       ORDER BY ft.due_date`,
      [farmerCropId]
    );
    return result.rows;
  }

  /**
   * Get tasks by farmer ID
   */
  static async findByFarmerId(farmerId) {
    const result = await db.query(
      `SELECT ft.*, fc.crop_id, c.name as crop_name, fc.sowing_date
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = $1
       ORDER BY ft.due_date`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get pending tasks for farmer
   */
  static async getPendingTasks(farmerId) {
    const result = await db.query(
      `SELECT ft.*, c.name as crop_name
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = $1 AND ft.status = 'pending'
       ORDER BY ft.due_date`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get today's tasks for farmer
   */
  static async getTodaysTasks(farmerId) {
    const result = await db.query(
      `SELECT ft.*, c.name as crop_name
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = $1 AND ft.due_date = CURRENT_DATE
       ORDER BY ft.due_date`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get task by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT ft.*, fc.farmer_id, fc.crop_id, c.name as crop_name
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE ft.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update task
   */
  static async update(id, taskData) {
    const { task_name, due_date, das, instructions, status } = taskData;
    const result = await db.query(
      `UPDATE farmer_tasks 
       SET task_name = COALESCE($1, task_name),
           due_date = COALESCE($2, due_date),
           das = COALESCE($3, das),
           instructions = COALESCE($4, instructions),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [task_name, due_date, das, instructions, status, id]
    );
    return result.rows[0];
  }

  /**
   * Complete task with notes and photo
   */
  static async complete(id, completionData) {
    const { completion_note, completion_photo } = completionData;
    const result = await db.query(
      `UPDATE farmer_tasks 
       SET status = 'done',
           completed_at = CURRENT_TIMESTAMP,
           completion_note = $1,
           completion_photo = $2
       WHERE id = $3
       RETURNING *`,
      [completion_note || null, completion_photo || null, id]
    );
    return result.rows[0];
  }

  /**
   * Get task compliance stats for farmer
   */
  static async getComplianceStats(farmerId) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'pending' AND due_date < CURRENT_DATE THEN 1 END) as overdue_tasks,
        COUNT(CASE WHEN status = 'pending' AND due_date = CURRENT_DATE THEN 1 END) as todays_tasks,
        ROUND(
          COUNT(CASE WHEN status = 'done' THEN 1 END)::numeric / 
          NULLIF(COUNT(*), 0) * 100, 2
        ) as completion_rate
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       WHERE fc.farmer_id = $1`,
      [farmerId]
    );
    return result.rows[0];
  }

  /**
   * Get all tasks for admin dashboard
   */
  static async getAllForAdmin(adminId) {
    const result = await db.query(
      `SELECT ft.*, u.name as farmer_name, c.name as crop_name
       FROM farmer_tasks ft
       JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
       JOIN users u ON fc.farmer_id = u.id
       JOIN crops c ON fc.crop_id = c.id
       ORDER BY ft.due_date`
    );
    return result.rows;
  }

  /**
   * Delete task
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM farmer_tasks WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = FarmerTask;