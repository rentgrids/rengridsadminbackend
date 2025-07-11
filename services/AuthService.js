import { Admin } from '../models/Admin.js';
import { generateJWT } from '../config/jwt.js';
import { comparePassword, generateResetToken, generateTokenExpiry, getClientIP, groupPermissionsByModule } from '../utils/helpers.js';
import { sendEmail, generatePasswordResetEmail } from '../config/email.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class AuthService {
  static async login(email, password, req) {
    try {
      // Find admin
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        logger.warn(`Login attempt with invalid email: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await query(
          'UPDATE admins SET login_attempts = login_attempts + 1 WHERE id = $1',
          [admin.id]
        );
        logger.warn(`Invalid password attempt for admin: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Update login info
      const clientIP = getClientIP(req);
      await Admin.updateLoginInfo(admin.id, clientIP);

      // Get roles and permissions
      const roles = await Admin.getRoles(admin.id);
      const permissionsArray = await Admin.getPermissions(admin.id);
      const permissions = groupPermissionsByModule(permissionsArray);

      // Generate JWT
      const token = generateJWT({
        adminId: admin.id,
        email: admin.email,
        isSuperAdmin: admin.is_super_admin
      });

      logger.info(`Successful login for admin: ${email}`);

      return {
        access_token: token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          status: admin.status,
          isSuperAdmin: admin.is_super_admin,
          roles,
          permissions
        }
      };
    } catch (error) {
      logger.error('AuthService login error:', error);
      throw error;
    }
  }

  static async forgotPassword(email, req) {
    try {
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        // Don't reveal if email exists
        logger.warn(`Password reset attempt for non-existent email: ${email}`);
        return { success: true };
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const expiresAt = generateTokenExpiry(30); // 30 minutes

      // Save reset token
      await query(
        'INSERT INTO admin_password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
        [email, resetToken, expiresAt]
      );

      // Send email
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&email=${email}`;
      const emailHTML = generatePasswordResetEmail(admin.name, resetLink);

      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: emailHTML
      });

      logger.info(`Password reset email sent to: ${email}`);
      return { success: true };
    } catch (error) {
      logger.error('AuthService forgotPassword error:', error);
      throw error;
    }
  }

  static async resetPassword(email, token, newPassword) {
    try {
      // Check if token is valid and not expired
      const tokenResult = await query(
        'SELECT * FROM admin_password_resets WHERE email = $1 AND token = $2 AND expires_at > NOW() AND used = FALSE',
        [email, token]
      );

      if (tokenResult.rows.length === 0) {
        logger.warn(`Invalid reset token attempt for email: ${email}`);
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const { hashPassword } = await import('../utils/helpers.js');
      const hashedPassword = await hashPassword(newPassword);

      // Update admin password
      await query(
        'UPDATE admins SET password = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, email]
      );

      // Mark token as used
      await query(
        'UPDATE admin_password_resets SET used = TRUE WHERE email = $1 AND token = $2',
        [email, token]
      );

      logger.info(`Password reset successful for admin: ${email}`);
      return { success: true };
    } catch (error) {
      logger.error('AuthService resetPassword error:', error);
      throw error;
    }
  }
}