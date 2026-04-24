const db = require('../config/database');

class FarmerCrop {
  /**
   * Assign a crop to a farmer with sowing date
   */
  static async create(farmerCropData) {
    const { farmer_id, crop_id, sowing_date } = farmerCropData;
    const result = await db.query(
      `INSERT INTO farmer_crops (farmer_id, crop_id, sowing_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [farmer_id, crop_id, sowing_date]
    );
    return result.rows[0];
  }

  /**
   * Get farmer crops by farmer ID
   */
  static async findByFarmerId(farmerId) {
    const result = await db.query(
      `SELECT fc.*, c.name as crop_name, c.variety as crop_variety, c.description as crop_description
       FROM farmer_crops fc
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = $1
       ORDER BY fc.created_at DESC`,
      [farmerId]
    );
    return result.rows;
  }

  /**
   * Get farmer crop by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT fc.*, c.name as crop_name, c.variety as crop_variety
       FROM farmer_crops fc
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update farmer crop
   */
  static async update(id, farmerCropData) {
    const { sowing_date } = farmerCropData;
    const result = await db.query(
      `UPDATE farmer_crops 
       SET sowing_date = COALESCE($1, sowing_date)
       WHERE id = $2
       RETURNING *`,
      [sowing_date, id]
    );
    return result.rows[0];
  }

  /**
   * Delete farmer crop
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM farmer_crops WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get farmer crop with tasks
   */
  static async getWithTasks(id) {
    const result = await db.query(
      `SELECT fc.*, c.name as crop_name, c.variety as crop_variety,
              json_agg(
                json_build_object(
                  'id', ft.id,
                  'task_name', ft.task_name,
                  'due_date', ft.due_date,
                  'das', ft.das,
                  'status', ft.status,
                  'instructions', ft.instructions
                )
              ) FILTER (WHERE ft.id IS NOT NULL) as tasks
       FROM farmer_crops fc
       JOIN crops c ON fc.crop_id = c.id
       LEFT JOIN farmer_tasks ft ON fc.id = ft.farmer_crop_id
       WHERE fc.id = $1
       GROUP BY fc.id`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = FarmerCrop;