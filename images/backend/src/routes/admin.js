import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PDFExportService } from '../services/PDFExportService.js';
import WorkoutSession from '../models/WorkoutSession.js';
import WorkoutTemplate from '../models/WorkoutTemplate.js';
import PersonalRecord from '../models/PersonalRecord.js';
import { UserStatsService } from '../services/UserStatsService.js';

const router = express.Router();
const userRepository = new UserRepository();
const adminController = new AdminController(userRepository);

// Admin authentication
router.post('/login', adminController.login.bind(adminController));

// Protected admin routes
router.get('/users', adminAuth, adminController.getUsers.bind(adminController));
router.get('/stats', adminAuth, adminController.getUserStats.bind(adminController));
router.get('/users/:userId/insights', adminAuth, adminController.getUserInsights.bind(adminController));
router.get('/insights', adminAuth, adminController.getAllUserInsights.bind(adminController));

// PDF Export Routes
router.get('/export/:userId/pdf', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'all' } = req.query;
    
    // Fetch user data
    const [sessions, templates, records, stats] = await Promise.all([
      WorkoutSession.find({ userId }).sort({ startTime: -1 }),
      WorkoutTemplate.find({ userId }).sort({ createdAt: -1 }),
      PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 }),
      new UserStatsService().getAllTimeStats(userId)
    ]);
    
    const userData = {
      userId,
      period,
      summary: stats,
      sessions,
      templates: templates.map(t => ({
        name: t.name,
        category: t.category,
        exerciseCount: t.exercises.length,
        totalUses: t.totalUses,
        createdAt: t.createdAt
      })),
      personalRecords: records.map(r => ({
        exerciseName: r.exerciseName,
        recordType: r.recordType,
        value: r.displayValue,
        date: r.setDate
      }))
    };
    
    // Generate PDF structure
    const pdfData = await PDFExportService.generateWorkoutPDF(userId, userData);
    
    // In a real implementation, this would generate an actual PDF file
    // For now, we'll return the structured data as JSON
    res.json({
      success: true,
      message: 'PDF data generated (JSON format for demo)',
      data: pdfData,
      filename: `workout-report-${userId}-${new Date().toISOString().split('T')[0]}.pdf`
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// CSV Export Routes
router.get('/export/:userId/csv', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [sessions, templates, records] = await Promise.all([
      WorkoutSession.find({ userId }).sort({ startTime: -1 }),
      WorkoutTemplate.find({ userId }).sort({ createdAt: -1 }),
      PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 })
    ]);
    
    const userData = {
      sessions,
      templates,
      personalRecords: records
    };
    
    const csvData = PDFExportService.generateCSVExport(userData);
    
    res.json({
      success: true,
      data: csvData,
      message: 'CSV data generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV',
      message: error.message
    });
  }
});

// Bulk Export (multiple users)
router.post('/export/bulk', adminAuth, async (req, res) => {
  try {
    const { userIds, format = 'json', period = 'all' } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
    }
    
    const exportData = {};
    
    for (const userId of userIds) {
      try {
        const [sessions, templates, records, stats] = await Promise.all([
          WorkoutSession.find({ userId }).sort({ startTime: -1 }),
          WorkoutTemplate.find({ userId }).sort({ createdAt: -1 }),
          PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 }),
          new UserStatsService().getAllTimeStats(userId)
        ]);
        
        exportData[userId] = {
          userId,
          period,
          summary: stats,
          sessions,
          templates: templates.map(t => ({
            name: t.name,
            category: t.category,
            exerciseCount: t.exercises.length,
            totalUses: t.totalUses,
            createdAt: t.createdAt
          })),
          personalRecords: records.map(r => ({
            exerciseName: r.exerciseName,
            recordType: r.recordType,
            value: r.displayValue,
            date: r.setDate
          }))
        };
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        exportData[userId] = { error: error.message };
      }
    }
    
    res.json({
      success: true,
      message: `Bulk export completed for ${userIds.length} users`,
      data: exportData,
      summary: {
        totalUsers: userIds.length,
        successfulExports: Object.keys(exportData).filter(key => !exportData[key].error).length,
        failedExports: Object.keys(exportData).filter(key => exportData[key].error).length
      }
    });
    
  } catch (error) {
    console.error('Error in bulk export:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk export failed',
      message: error.message
    });
  }
});

export default router;