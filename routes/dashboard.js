import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';

const router = express.Router();

// ============ METRICS ROUTES ============
router.get('/metrics/total-properties', DashboardController.getTotalProperties);
router.get('/metrics/active-listings', DashboardController.getActiveListings);
router.get('/metrics/active-leases', DashboardController.getActiveLeases);
router.get('/metrics/tenant-count', DashboardController.getTenantCount);
router.get('/metrics/landlord-count', DashboardController.getLandlordCount);
router.get('/metrics/revenue', DashboardController.getRevenue);
router.get('/metrics/admin-count', DashboardController.getAdminCount);
router.get('/metrics/new-inquiries-today', DashboardController.getNewInquiriesToday);

// ============ CHARTS ROUTES ============
router.get('/charts/property-status', DashboardController.getPropertyStatusChart);
router.get('/charts/revenue-trend', DashboardController.getRevenueTrendChart);
router.get('/charts/user-growth', DashboardController.getUserGrowthChart);
router.get('/charts/lease-status', DashboardController.getLeaseStatusChart);
router.get('/charts/inquiry-source', DashboardController.getInquirySourceChart);

// ============ RECENT DATA ROUTES ============
router.get('/recent/properties', DashboardController.getRecentProperties);
router.get('/recent/users', DashboardController.getRecentUsers);
router.get('/recent/activities', DashboardController.getRecentActivities);

export default router;