const db = require('../config/database');

class ScheduleTemplate {
  /**
   * Create a new schedule template
   */
  static async create(templateData) {
    const { crop_id, task_name, days_after_sowing, instructions } = templateData;
    const result = await db.query(
      `INSERT INTO schedule_templates (crop_id, task_name, days_after_sowing, instructions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [crop_id, task_name, days_after_sowing, instructions || null]
    );
    return result.rows[0];
  }

  /**
   * Get all schedule templates
   */
  static async getAll() {
    const result = await db.query(
      `SELECT st.*, c.name as crop_name, c.variety as crop_variety
       FROM schedule_templates st
       JOIN crops c ON st.crop_id = c.id
       ORDER BY c.name, st.days_after_sowing`
    );
    return result.rows;
  }

  /**
   * Get templates by crop ID
   */
  static async findByCropId(cropId) {
    const result = await db.query(
      `SELECT * FROM schedule_templates 
       WHERE crop_id = $1 
       ORDER BY days_after_sowing`,
      [cropId]
    );
    return result.rows;
  }

  /**
   * Get template by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT st.*, c.name as crop_name
       FROM schedule_templates st
       JOIN crops c ON st.crop_id = c.id
       WHERE st.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update template
   */
  static async update(id, templateData) {
    const { task_name, days_after_sowing, instructions } = templateData;
    const result = await db.query(
      `UPDATE schedule_templates 
       SET task_name = COALESCE($1, task_name),
           days_after_sowing = COALESCE($2, days_after_sowing),
           instructions = COALESCE($3, instructions)
       WHERE id = $4
       RETURNING *`,
      [task_name, days_after_sowing, instructions, id]
    );
    return result.rows[0];
  }

  /**
   * Delete template
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM schedule_templates WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = ScheduleTemplate;