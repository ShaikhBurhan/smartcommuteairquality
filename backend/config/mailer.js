import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Nodemailer Transport ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email using Nodemailer
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Smart Commute" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️  Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        throw error;
    }
};

// ─── HTML Email Templates ──────────────────────────────────────────────────────

export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 48px 40px; text-align: center; }
    .header h1 { color: #34d399; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px; }
    .header p { color: #94a3b8; font-size: 14px; margin: 0; }
    .body { padding: 40px; }
    .body h2 { color: #0f172a; font-size: 22px; margin: 0 0 16px 0; }
    .body p { color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Smart Commute</h1>
      <p>Air Quality Intelligence Platform</p>
    </div>
    <div class="body">
      <h2>Welcome aboard, ${userName}! 🎉</h2>
      <p>Your telemetry node has been successfully deployed. You now have access to real-time air quality monitoring, intelligent route planning, and eco-score tracking.</p>
      <p>Here's what you can do:</p>
      <p>✅ Plan routes with the lowest pollution exposure<br>
         ✅ Monitor live AQI data across cities<br>
         ✅ Track your eco-score and CO₂ savings<br>
         ✅ View your commute history and analytics</p>
      <a href="http://localhost:5173/dashboard" class="btn">Open Dashboard →</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Smart Commute Air Quality. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const resetPasswordTemplate = (userName, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 48px 40px; text-align: center; }
    .header h1 { color: #f87171; font-size: 28px; margin: 0 0 8px 0; }
    .header p { color: #94a3b8; font-size: 14px; margin: 0; }
    .body { padding: 40px; }
    .body h2 { color: #0f172a; font-size: 22px; margin: 0 0 16px 0; }
    .body p { color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .btn { display: inline-block; background: #ef4444; color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px; }
    .code { background: #f1f5f9; padding: 16px 24px; border-radius: 12px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; color: #0f172a; font-weight: 700; margin: 16px 0; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset</h1>
      <p>Smart Commute Security</p>
    </div>
    <div class="body">
      <h2>Hi ${userName},</h2>
      <p>We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Smart Commute Air Quality. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const otpVerificationTemplate = (userName, otp) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 48px 40px; text-align: center; }
    .header h1 { color: #34d399; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px; }
    .header p { color: #94a3b8; font-size: 14px; margin: 0; }
    .body { padding: 40px; }
    .body h2 { color: #0f172a; font-size: 22px; margin: 0 0 16px 0; }
    .body p { color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .otp-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px dashed #34d399; padding: 24px; border-radius: 16px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #059669; margin: 0; }
    .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6ee7b7; margin-top: 8px; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    .warning { background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 12px; margin-top: 16px; }
    .warning p { color: #92400e; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Smart Commute</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <h2>Hi ${userName}, verify your email 📧</h2>
      <p>Thanks for registering! Please use the verification code below to confirm your email address and activate your account.</p>
      <div class="otp-box">
        <p class="otp-code">${otp}</p>
        <p class="otp-label">Verification Code</p>
      </div>
      <p>Enter this code on the verification page to complete your registration.</p>
      <div class="warning">
        <p>⏰ This code expires in <strong>10 minutes</strong>. If you didn't register on Smart Commute, please ignore this email.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Smart Commute Air Quality. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
