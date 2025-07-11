import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class DashboardService {
  // ============ METRICS SERVICES ============
  static async getTotalProperties() {
    try {
      const result = await query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM properties 
        WHERE is_deleted = FALSE
        GROUP BY status
        ORDER BY count DESC
      `);

      const totalCount = await query(`
        SELECT COUNT(*) as total 
        FROM properties 
        WHERE is_deleted = FALSE
      `);

      return {
        total: parseInt(totalCount.rows[0].total),
        by_status: result.rows
      };
    } catch (error) {
      logger.error('DashboardService getTotalProperties error:', error);
      throw error;
    }
  }

  static async getActiveListings() {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM properties 
        WHERE status = 'published' AND is_deleted = FALSE
      `);

      return {
        count: parseInt(result.rows[0].count)
      };
    } catch (error) {
      logger.error('DashboardService getActiveListings error:', error);
      throw error;
    }
  }

  static async getActiveLeases() {
    try {
      // Since we don't have a lease table, we'll count rented properties
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM properties 
        WHERE status = 'rented' AND is_deleted = FALSE
      `);

      return {
        count: parseInt(result.rows[0].count)
      };
    } catch (error) {
      logger.error('DashboardService getActiveLeases error:', error);
      throw error;
    }
  }

  static async getTenantCount() {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE user_type = 'tenant' AND is_deleted = FALSE
      `);

      return {
        count: parseInt(result.rows[0].count)
      };
    } catch (error) {
      logger.error('DashboardService getTenantCount error:', error);
      throw error;
    }
  }

  static async getLandlordCount() {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE user_type = 'landlord' AND is_deleted = FALSE
      `);

      return {
        count: parseInt(result.rows[0].count)
      };
    } catch (error) {
      logger.error('DashboardService getLandlordCount error:', error);
      throw error;
    }
  }

  static async getRevenue() {
    try {
      // Mock revenue data since we don't have a revenue table
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = 125000 + Math.floor(Math.random() * 50000);
      const cumulativeRevenue = monthlyRevenue * currentMonth + Math.floor(Math.random() * 100000);

      return {
        monthly: monthlyRevenue,
        cumulative: cumulativeRevenue,
        currency: 'INR',
        month: currentMonth,
        year: currentYear
      };
    } catch (error) {
      logger.error('DashboardService getRevenue error:', error);
      throw error;
    }
  }

  static async getAdminCount() {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM admins 
        WHERE status = 'active'
      `);

      return {
        count: parseInt(result.rows[0].count)
      };
    } catch (error) {
      logger.error('DashboardService getAdminCount error:', error);
      throw error;
    }
  }

  static async getNewInquiriesToday() {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM property_visits 
        WHERE DATE(created_at) = CURRENT_DATE
      `);

      return {
        count: parseInt(result.rows[0].count || 0)
      };
    } catch (error) {
      logger.error('DashboardService getNewInquiriesToday error:', error);
      // Return 0 if table doesn't exist
      return { count: 0 };
    }
  }

  // ============ CHARTS SERVICES ============
  static async getPropertyStatusChart() {
    try {
      const result = await query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
        FROM properties 
        WHERE is_deleted = FALSE
        GROUP BY status
        ORDER BY count DESC
      `);

      return {
        labels: result.rows.map(row => row.status),
        data: result.rows.map(row => parseInt(row.count)),
        percentages: result.rows.map(row => parseFloat(row.percentage))
      };
    } catch (error) {
      logger.error('DashboardService getPropertyStatusChart error:', error);
      throw error;
    }
  }

  static async getRevenueTrendChart() {
    try {
      // Mock revenue trend data for the last 12 months
      const months = [];
      const revenue = [];
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        revenue.push(80000 + Math.floor(Math.random() * 100000));
      }

      return {
        labels: months,
        data: revenue,
        currency: 'INR'
      };
    } catch (error) {
      logger.error('DashboardService getRevenueTrendChart error:', error);
      throw error;
    }
  }

  static async getUserGrowthChart() {
    try {
      const result = await query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          user_type,
          COUNT(*) as count
        FROM users 
        WHERE is_deleted = FALSE 
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at), user_type
        ORDER BY month DESC
      `);

      // Process data for chart
      const monthlyData = {};
      result.rows.forEach(row => {
        const month = new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { tenant: 0, landlord: 0, user: 0 };
        }
        monthlyData[month][row.user_type] = parseInt(row.count);
      });

      return {
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: 'Tenants',
            data: Object.values(monthlyData).map(d => d.tenant)
          },
          {
            label: 'Landlords',
            data: Object.values(monthlyData).map(d => d.landlord)
          },
          {
            label: 'Users',
            data: Object.values(monthlyData).map(d => d.user)
          }
        ]
      };
    } catch (error) {
      logger.error('DashboardService getUserGrowthChart error:', error);
      throw error;
    }
  }

  static async getLeaseStatusChart() {
    try {
      // Mock lease status data
      const leaseStatuses = [
        { status: 'Active', count: 45, color: '#10B981' },
        { status: 'Pending', count: 12, color: '#F59E0B' },
        { status: 'Expired', count: 8, color: '#EF4444' },
        { status: 'Terminated', count: 5, color: '#6B7280' }
      ];

      return {
        labels: leaseStatuses.map(l => l.status),
        data: leaseStatuses.map(l => l.count),
        colors: leaseStatuses.map(l => l.color)
      };
    } catch (error) {
      logger.error('DashboardService getLeaseStatusChart error:', error);
      throw error;
    }
  }

  static async getInquirySourceChart() {
    try {
      // Mock inquiry source data
      const sources = [
        { source: 'Organic Search', count: 35, percentage: 35 },
        { source: 'Social Media Ads', count: 25, percentage: 25 },
        { source: 'Referrals', count: 20, percentage: 20 },
        { source: 'Direct Traffic', count: 15, percentage: 15 },
        { source: 'Email Marketing', count: 5, percentage: 5 }
      ];

      return {
        labels: sources.map(s => s.source),
        data: sources.map(s => s.count),
        percentages: sources.map(s => s.percentage)
      };
    } catch (error) {
      logger.error('DashboardService getInquirySourceChart error:', error);
      throw error;
    }
  }

  // ============ RECENT DATA SERVICES ============
  static async getRecentProperties(limit = 10) {
    try {
      const result = await query(`
        SELECT 
          p.id,
          p.title,
          p.status,
          p.price,
          p.city,
          p.created_at as listed_date,
          u.name as owner_name,
          u.email as owner_email
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.is_deleted = FALSE
        ORDER BY p.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      logger.error('DashboardService getRecentProperties error:', error);
      throw error;
    }
  }

  static async getRecentUsers(limit = 10) {
    try {
      const result = await query(`
        SELECT 
          id,
          name,
          email,
          user_type,
          status,
          is_verified as kyc_status,
          created_at as registration_date
        FROM users
        WHERE is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      logger.error('DashboardService getRecentUsers error:', error);
      throw error;
    }
  }

  static async getRecentActivities(limit = 20) {
    try {
      // Combine different activities
      const activities = [];

      // Recent property submissions
      const properties = await query(`
        SELECT 
          'property_submitted' as activity_type,
          'New property submitted: ' || title as description,
          created_at,
          id as reference_id
        FROM properties
        WHERE is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Recent user signups
      const users = await query(`
        SELECT 
          'user_signup' as activity_type,
          'New ' || user_type || ' registered: ' || name as description,
          created_at,
          id as reference_id
        FROM users
        WHERE is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Recent admin logins
      const adminLogins = await query(`
        SELECT 
          'admin_login' as activity_type,
          'Admin login: ' || name as description,
          last_login_at as created_at,
          id as reference_id
        FROM admins
        WHERE last_login_at IS NOT NULL
        ORDER BY last_login_at DESC
        LIMIT 5
      `);

      // Combine and sort all activities
      const allActivities = [
        ...properties.rows,
        ...users.rows,
        ...adminLogins.rows
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
       .slice(0, limit);

      return allActivities;
    } catch (error) {
      logger.error('DashboardService getRecentActivities error:', error);
      throw error;
    }
  }
}