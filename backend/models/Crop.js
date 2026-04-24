const db = require('../config/database');

class Crop {
  /**
   * Create a new crop
   */
  static async create(cropData) {
    const { name, variety, description } = cropData;
    const result = await db.query(
      `INSERT INTO crops (name, variety, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, variety || null, description || null]
    );
    return result.rows[0];
  }

  /**
   * Get all crops
   */
  static async getAll() {
    const result = await db.query(
      `SELECT c.*, 
              COUNT(st.id) as template_count
       FROM crops c
       LEFT JOIN schedule_templates st ON c.id = st.crop_id
       GROUP BY c.id
       ORDER BY c.name`
    );
    return result.rows;
  }

  /**
   * Get crop by ID
   */
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM crops WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update crop
   */
  static async update(id, cropData) {
    const { name, variety, description } = cropData;
    const result = await db.query(
      `UPDATE crops 
       SET name = COALESCE($1, name),
           variety = COALESCE($2, variety),
           description = COALESCE($3, description)
       WHERE id = $4
       RETURNING *`,
      [name, variety, description, id]
    );
    return result.rows[0];
  }

  /**
   * Delete crop
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM crops WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Crop;