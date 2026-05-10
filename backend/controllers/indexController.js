export const getHealthCheck = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running smoothly.',
        timestamp: new Date().toISOString()
    });
};
