import User from '../models/User.js';
import { sendOTP as twilioSendOTP, verifyOTP as twilioVerifyOTP, sendSMS } from '../config/twilioClient.js';

// @desc    Send OTP to phone number
// @route   POST /api/sms/send-otp
// @access  Private
export const sendOTPController = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a phone number in E.164 format (e.g., +919876543210)',
            });
        }

        // Send OTP via Twilio Verify
        const verification = await twilioSendOTP(phone);

        // Save phone to user profile (unverified)
        await User.findByIdAndUpdate(req.user.id, {
            phone,
            isPhoneVerified: false,
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            status: verification.status,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/sms/verify-otp
// @access  Private
export const verifyOTPController = async (req, res) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number and OTP code',
            });
        }

        // Verify OTP via Twilio
        const verificationCheck = await twilioVerifyOTP(phone, code);

        if (verificationCheck.status === 'approved') {
            // Mark phone as verified
            await User.findByIdAndUpdate(req.user.id, {
                phone,
                isPhoneVerified: true,
            });

            res.status(200).json({
                success: true,
                message: 'Phone number verified successfully',
                status: verificationCheck.status,
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP code. Please try again.',
                status: verificationCheck.status,
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a custom SMS notification (admin use)
// @route   POST /api/sms/send
// @access  Private
export const sendSMSController = async (req, res) => {
    try {
        const { to, body } = req.body;

        if (!to || !body) {
            return res.status(400).json({
                success: false,
                message: 'Please provide "to" phone number and "body" message',
            });
        }

        const message = await sendSMS({ to, body });

        res.status(200).json({
            success: true,
            message: 'SMS sent successfully',
            sid: message.sid,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
