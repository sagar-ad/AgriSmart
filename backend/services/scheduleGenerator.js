const db = require('../config/database');
const FarmerCrop = require('../models/FarmerCrop');
const FarmerTask = require('../models/FarmerTask');
const ScheduleTemplate = require('../models/ScheduleTemplate');
const { formatDate, addDays } = require('../utils/dateUtils');

/**
 * Schedule Generator Service
 * Automatically generates farmer tasks from schedule templates when a crop is assigned
 */
class ScheduleGenerator {
  /**
   * Generate tasks for a farmer crop assignment
   * @param {number} farmerCropId - The ID of the farmer_crop record
   * @param {number} cropId - The crop ID
   * @param {string} sowingDate - The sowing date (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array of created tasks
   */
  static async generateTasks(farmerCropId, cropId, sowingDate) {
    try {
      // Get all schedule templates for this crop
      const templates = await ScheduleTemplate.findByCropId(cropId);
      
      if (!templates || templates.length === 0) {
        console.log(`No schedule templates found for crop ID ${cropId}`);
        return [];
      }

      // Generate tasks from templates
      const tasks = templates.map(template => {
        const dueDate = addDays(sowingDate, template.days_after_sowing);
        return {
          farmer_crop_id: farmerCropId,
          task_name: template.task_name,
          due_date: formatDate(dueDate),
          das: template.days_after_sowing,
          instructions: template.instructions
        };
      });

      // Bulk insert tasks
      const createdTasks = await FarmerTask.bulkCreate(tasks);
      console.log(`Generated ${createdTasks.length} tasks for farmer_crop ID ${farmerCropId}`);
      
      return createdTasks;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  /**
   * Assign a crop to a farmer and generate tasks
   * @param {number} farmerId - Farmer user ID
   * @param {number} cropId - Crop ID
   * @param {string} sowingDate - Sowing date (YYYY-MM-DD)
   * @returns {Promise<Object>} - The created farmer crop with tasks
   */
  static async assignCropToFarmer(farmerId, cropId, sowingDate) {
    try {
      // Create farmer crop record
      const farmerCrop = await FarmerCrop.create({
        farmer_id: farmerId,
        crop_id: cropId,
        sowing_date: sowingDate
      });

      // Generate tasks from templates
      const tasks = await ScheduleGenerator.generateTasks(
        farmerCrop.id,
        cropId,
        sowingDate
      );

      return {
        ...farmerCrop,
        tasks
      };
    } catch (error) {
      console.error('Error assigning crop to farmer:', error);
      throw error;
    }
  }

  /**
   * Regenerate tasks for a farmer crop (e.g., if sowing date changed)
   * @param {number} farmerCropId - The farmer_crop ID
   * @param {string} newSowingDate - New sowing date
   * @returns {Promise<Array>} - New array of tasks
   */
  static async regenerateTasks(farmerCropId, newSowingDate) {
    try {
      // Get the farmer crop
      const farmerCrop = await FarmerCrop.findById(farmerCropId);
      
      if (!farmerCrop) {
        throw new Error('Farmer crop not found');
      }

      // Delete existing tasks
      await db.query('DELETE FROM farmer_tasks WHERE farmer_crop_id = $1', [farmerCropId]);

      // Generate new tasks
      const tasks = await ScheduleGenerator.generateTasks(
        farmerCropId,
        farmerCrop.crop_id,
        newSowingDate
      );

      // Update farmer crop sowing date
      await FarmerCrop.update(farmerCropId, { sowing_date: newSowingDate });

      return tasks;
    } catch (error) {
      console.error('Error regenerating tasks:', error);
      throw error;
    }
  }

  /**
   * Get task timeline for a farmer's crop
   * @param {number} farmerCropId - The farmer_crop ID
   * @returns {Promise<Array>} - Tasks organized by DAS
   */
  static async getTaskTimeline(farmerCropId) {
    const tasks = await FarmerTask.findByFarmerCropId(farmerCropId);
    
    // Group by DAS ranges
    const timeline = {
      germination: tasks.filter(t => t.das <= 15),
      vegetative: tasks.filter(t => t.das > 15 && t.das <= 45),
      flowering: tasks.filter(t => t.das > 45 && t.das <= 75),
      fruiting: tasks.filter(t => t.das > 75 && t.das <= 120),
      maturity: tasks.filter(t => t.das > 120),
      all: tasks
    };

    return timeline;
  }

  /**
   * Calculate progress for a farmer's crop
   * @param {number} farmerCropId - The farmer_crop ID
   * @returns {Promise<Object>} - Progress statistics
   */
  static async getProgress(farmerCropId) {
    const tasks = await FarmerTask.findByFarmerCropId(farmerCropId);
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.due_date) < new Date()).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

module.exports = ScheduleGenerator;