import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                'user_registered',
                'user_deleted',
                'aqi_alert',
                'city_added',
                'city_removed',
                'route_calculated',
                'report_generated',
                'admin_login',
                'payment_success',
            ],
        },
        message: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            default: 'info',
            enum: ['info', 'warning', 'critical', 'success'],
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    { timestamps: true }
);

// Auto-expire logs after 30 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
