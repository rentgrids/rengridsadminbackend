import { DashboardService } from '../services/DashboardService.js';
import { formatResponse } from '../utils/helpers.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export class DashboardController {
  // ============ METRICS APIs ============
  static getTotalProperties = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getTotalProperties();
        res.json(formatResponse(true, 'Total properties retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getTotalProperties error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve total properties'));
      }
    }
  ];

  static getActiveListings = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getActiveListings();
        res.json(formatResponse(true, 'Active listings retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getActiveListings error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve active listings'));
      }
    }
  ];

  static getActiveLeases = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getActiveLeases();
        res.json(formatResponse(true, 'Active leases retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getActiveLeases error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve active leases'));
      }
    }
  ];

  static getTenantCount = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getTenantCount();
        res.json(formatResponse(true, 'Tenant count retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getTenantCount error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve tenant count'));
      }
    }
  ];

  static getLandlordCount = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getLandlordCount();
        res.json(formatResponse(true, 'Landlord count retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getLandlordCount error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve landlord count'));
      }
    }
  ];

  static getRevenue = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getRevenue();
        res.json(formatResponse(true, 'Revenue data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getRevenue error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve revenue data'));
      }
    }
  ];

  static getAdminCount = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getAdminCount();
        res.json(formatResponse(true, 'Admin count retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getAdminCount error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve admin count'));
      }
    }
  ];

  static getNewInquiriesToday = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getNewInquiriesToday();
        res.json(formatResponse(true, 'New inquiries today retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getNewInquiriesToday error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve new inquiries today'));
      }
    }
  ];

  // ============ CHARTS APIs ============
  static getPropertyStatusChart = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getPropertyStatusChart();
        res.json(formatResponse(true, 'Property status chart data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getPropertyStatusChart error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve property status chart data'));
      }
    }
  ];

  static getRevenueTrendChart = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getRevenueTrendChart();
        res.json(formatResponse(true, 'Revenue trend chart data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getRevenueTrendChart error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve revenue trend chart data'));
      }
    }
  ];

  static getUserGrowthChart = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getUserGrowthChart();
        res.json(formatResponse(true, 'User growth chart data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getUserGrowthChart error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve user growth chart data'));
      }
    }
  ];

  static getLeaseStatusChart = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getLeaseStatusChart();
        res.json(formatResponse(true, 'Lease status chart data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getLeaseStatusChart error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve lease status chart data'));
      }
    }
  ];

  static getInquirySourceChart = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const result = await DashboardService.getInquirySourceChart();
        res.json(formatResponse(true, 'Inquiry source chart data retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getInquirySourceChart error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve inquiry source chart data'));
      }
    }
  ];

  // ============ RECENT DATA APIs ============
  static getRecentProperties = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const result = await DashboardService.getRecentProperties(limit);
        res.json(formatResponse(true, 'Recent properties retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getRecentProperties error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve recent properties'));
      }
    }
  ];

  static getRecentUsers = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const result = await DashboardService.getRecentUsers(limit);
        res.json(formatResponse(true, 'Recent users retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getRecentUsers error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve recent users'));
      }
    }
  ];

  static getRecentActivities = [
    verifyAdminJWT,
    requirePermission('dashboard', 'view'),
    async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await DashboardService.getRecentActivities(limit);
        res.json(formatResponse(true, 'Recent activities retrieved successfully', result));
      } catch (error) {
        logger.error('DashboardController getRecentActivities error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve recent activities'));
      }
    }
  ];
}