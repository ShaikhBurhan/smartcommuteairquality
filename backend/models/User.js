import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false, // Do not return password by default
        },

        // ─── Email Verification ───────────────────────────────────
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationOTP: String,
        emailVerificationExpire: Date,

        // ─── Phone / SMS Verification ─────────────────────────────
        phone: {
            type: String,
            default: null,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        // ─── Password Reset ───────────────────────────────────────
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // ─── Premium / Payment ────────────────────────────────────
        isPremium: {
            type: Boolean,
            default: false,
        },
        premiumPlan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },
        premiumExpiresAt: {
            type: Date,
            default: null,
        },
        paymentHistory: [
            {
                orderId: String,
                paymentId: String,
                amount: Number,
                currency: { type: String, default: 'INR' },
                plan: String,
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and store it
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiry to 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Return the un-hashed token (sent to user via email)
    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
