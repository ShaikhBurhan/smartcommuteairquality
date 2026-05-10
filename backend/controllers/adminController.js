import User from '../models/User.js';
import CityAQI from '../models/CityAQI.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.status(200).json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                },
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await User.deleteOne({ _id: user._id });

            // Log the deletion activity
            await ActivityLog.create({
                type: 'user_deleted',
                message: `User deleted: ${user.email}`,
                severity: 'warning',
                relatedId: user._id,
            });

            res.status(200).json({ success: true, message: 'User removed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard statistics (live from DB)
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
    try {
        // All counts in parallel
        const [totalUsers, totalCities, highAqiAlerts, recentActivity] = await Promise.all([
            User.countDocuments(),
            CityAQI.countDocuments({ isActive: true }),
            CityAQI.countDocuments({ isActive: true, lastAqi: { $gt: 150 } }),
            ActivityLog.find().sort({ createdAt: -1 }).limit(10),
        ]);

        // User growth: compare current month vs last month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [currentMonthUsers, lastMonthUsers] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
        ]);

        const growthPercent = lastMonthUsers > 0
            ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
            : currentMonthUsers > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCities,
                highAqiAlerts,
                userGrowthPercent: growthPercent,
                recentActivity: recentActivity.map(a => ({
                    _id: a._id,
                    type: a.type,
                    message: a.message,
                    severity: a.severity,
                    time: a.createdAt,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get report/analytics data (aggregated from DB)
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getReportData = async (req, res) => {
    try {
        const [mostPolluted, cleanest, totalUsers, totalCities, allCities] = await Promise.all([
            CityAQI.findOne({ isActive: true, lastAqi: { $ne: null } }).sort({ lastAqi: -1 }),
            CityAQI.findOne({ isActive: true, lastAqi: { $gt: 0 } }).sort({ lastAqi: 1 }),
            User.countDocuments(),
            CityAQI.countDocuments({ isActive: true }),
            CityAQI.find({ isActive: true, lastAqi: { $ne: null } }),
        ]);

        // Calculate average AQI across all monitored cities
        const avgAQI = allCities.length > 0
            ? Math.round(allCities.reduce((sum, c) => sum + (c.lastAqi || 0), 0) / allCities.length)
            : null;

        // Monthly user registrations (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRegistrations = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Count critical events in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const criticalEventsToday = await ActivityLog.countDocuments({
            severity: 'critical',
            createdAt: { $gte: oneDayAgo },
        });

        res.status(200).json({
            success: true,
            data: {
                mostPolluted: mostPolluted
                    ? { city: mostPolluted.city, aqi: mostPolluted.lastAqi, status: mostPolluted.lastStatus }
                    : null,
                cleanest: cleanest
                    ? { city: cleanest.city, aqi: cleanest.lastAqi, status: cleanest.lastStatus }
                    : null,
                totalUsers,
                totalCities,
                avgAQI,
                monthlyRegistrations,
                criticalEventsToday,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
