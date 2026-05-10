import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail, welcomeEmailTemplate, resetPasswordTemplate, otpVerificationTemplate } from '../config/mailer.js';
import {
    generateAccessToken,
    generateRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
} from '../config/generateTokens.js';

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (sends OTP to email for verification)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            // If user exists but email not verified, allow re-sending OTP
            if (!userExists.isEmailVerified) {
                const otp = generateOTP();
                userExists.emailVerificationOTP = otp;
                userExists.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 min
                await userExists.save({ validateBeforeSave: false });

                try {
                    await sendEmail({
                        to: userExists.email,
                        subject: '🌿 Smart Commute — Verify Your Email',
                        html: otpVerificationTemplate(userExists.name, otp),
                    });
                } catch (emailErr) {
                    console.error('OTP email failed:', emailErr.message);
                }

                return res.status(200).json({
                    success: true,
                    requiresVerification: true,
                    email: userExists.email,
                    message: 'Verification OTP re-sent to your email.',
                });
            }
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate OTP
        const otp = generateOTP();

        const user = await User.create({
            name,
            email,
            password,
            isEmailVerified: false,
            emailVerificationOTP: otp,
            emailVerificationExpire: Date.now() + 10 * 60 * 1000, // 10 min
        });

        if (user) {
            // Log registration
            await ActivityLog.create({
                type: 'user_registered',
                message: `New user registered (pending verification): ${user.email}`,
                severity: 'info',
                relatedId: user._id,
            });

            // Send OTP verification email
            try {
                await sendEmail({
                    to: user.email,
                    subject: '🌿 Smart Commute — Verify Your Email',
                    html: otpVerificationTemplate(user.name, otp),
                });
            } catch (emailErr) {
                console.error('OTP email failed:', emailErr.message);
            }

            res.status(201).json({
                success: true,
                requiresVerification: true,
                email: user.email,
                message: 'Registration successful! Please check your email for the verification code.',
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email,
            emailVerificationOTP: otp,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.',
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Generate tokens — now the user is fully registered
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setRefreshTokenCookie(res, refreshToken);

        // Send welcome email
        try {
            await sendEmail({
                to: user.email,
                subject: '🌿 Welcome to Smart Commute — Your Node is Live!',
                html: welcomeEmailTemplate(user.name),
            });
        } catch (emailErr) {
            console.error('Welcome email failed (non-critical):', emailErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: accessToken,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with that email' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        user.emailVerificationOTP = otp;
        user.emailVerificationExpire = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                to: user.email,
                subject: '🌿 Smart Commute — Your New Verification Code',
                html: otpVerificationTemplate(user.name, otp),
            });
        } catch (emailErr) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'New verification code sent to your email.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Check if email is verified
            if (!user.isEmailVerified) {
                // Resend OTP automatically
                const otp = generateOTP();
                user.emailVerificationOTP = otp;
                user.emailVerificationExpire = Date.now() + 10 * 60 * 1000;
                await user.save({ validateBeforeSave: false });

                try {
                    await sendEmail({
                        to: user.email,
                        subject: '🌿 Smart Commute — Verify Your Email',
                        html: otpVerificationTemplate(user.name, otp),
                    });
                } catch (emailErr) {
                    console.error('OTP email failed:', emailErr.message);
                }

                return res.status(200).json({
                    success: true,
                    requiresVerification: true,
                    email: user.email,
                    message: 'Please verify your email first. A new code has been sent.',
                });
            }

            // Generate tokens
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            setRefreshTokenCookie(res, refreshToken);

            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                token: accessToken,
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh-token
// @access  Public (cookie required)
export const refreshTokenHandler = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        setRefreshTokenCookie(res, newRefreshToken);

        res.json({
            success: true,
            token: newAccessToken,
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

// @desc    Logout — clear refresh token cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
    clearRefreshTokenCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with that email' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: '🔒 Smart Commute — Password Reset Request',
                html: resetPasswordTemplate(user.name, resetUrl),
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully',
            });
        } catch (emailErr) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.',
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
