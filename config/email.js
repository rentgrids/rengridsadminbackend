import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Check if email credentials are configured
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      logger.warn('Email credentials not configured, skipping email send');
      return { success: true, messageId: 'email-disabled' };
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@admin-system.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending error:', error);

    // If it's an authentication error, log it but don't throw
    if (error.code === 'EAUTH') {
      logger.warn('Email authentication failed - check SMTP credentials');
      return { success: true, messageId: 'email-auth-failed' };
    }

    throw error;
  }
};

export const generatePasswordResetEmail = (name, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request this, please ignore this email. The link will expire in 30 minutes.</p>
          <p>For security, this link can only be used once.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};