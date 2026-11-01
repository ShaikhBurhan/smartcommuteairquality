import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dns from 'node:dns';
import routes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aqiRoutes from './routes/aqiRoutes.js';
import primRoutes from './routes/primRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Resolve MongoDB SRV records reliably across all Windows local network/DNS configurations
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('Could not set custom DNS servers:', e.message);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const allowedOrigins = (process.env.CLIENT_ORIGINS
    || 'https://smartcommuteairquality.vercel.app,http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

if (!mongoUri) {
    console.error('MONGO_URI is missing. Add your MongoDB Atlas connection string to backend/.env.');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/prim', primRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Route
app.get('/api/status', (req, res) => {
    res.json({ status: 'success', message: 'Backend is running successfully.' });
});

// Database Connection
mongoose
    .connect(mongoUri, {
        // useNewUrlParser and useUnifiedTopology are deprecated in newer Mongoose versions
    })
    .then(() => {
        console.log('Connected to MongoDB successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
