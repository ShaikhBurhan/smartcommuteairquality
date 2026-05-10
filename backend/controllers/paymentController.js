import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import dotenv from 'dotenv';
dotenv.config();

// Lazy-initialize Razorpay (only on first payment request)
let _razorpay = null;
const getRazorpay = () => {
    if (!_razorpay) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
        }
        _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    return _razorpay;
};

// Plan pricing (in paise — ₹ × 100)
const PLANS = {
    pro: { amount: 4900, currency: 'INR', name: 'Pro Plan', duration: 30 },             // ₹49/month
    enterprise: { amount: 14900, currency: 'INR', name: 'Premium Plan', duration: 30 }, // ₹149/month
};

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body; // 'pro' or 'enterprise'

        if (!plan || !PLANS[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan. Choose "pro" or "enterprise".',
            });
        }

        const planDetails = PLANS[plan];

        const options = {
            amount: planDetails.amount,
            currency: planDetails.currency,
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: req.user.id.toString(),
                plan,
            },
        };

        const order = await getRazorpay().orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
            planName: planDetails.name,
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Razorpay payment signature and activate premium
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed — invalid signature',
            });
        }

        // Payment is verified — activate premium
        const planDetails = PLANS[plan] || PLANS.pro;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + planDetails.duration);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                isPremium: true,
                premiumPlan: plan || 'pro',
                premiumExpiresAt: expiresAt,
                $push: {
                    paymentHistory: {
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        amount: planDetails.amount / 100, // Convert paise to rupees
                        currency: planDetails.currency,
                        plan: plan || 'pro',
                        date: new Date(),
                    },
                },
            },
            { new: true }
        );

        // Log activity
        await ActivityLog.create({
            type: 'payment_success',
            message: `User ${user.email} upgraded to ${plan || 'pro'} plan (₹${planDetails.amount / 100})`,
            severity: 'info',
            relatedId: user._id,
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified and premium activated!',
            data: {
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                premiumExpiresAt: user.premiumExpiresAt,
            },
        });
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's payment history
// @route   GET /api/payment/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('paymentHistory isPremium premiumPlan premiumExpiresAt');

        res.status(200).json({
            success: true,
            data: {
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                premiumExpiresAt: user.premiumExpiresAt,
                history: user.paymentHistory || [],
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
