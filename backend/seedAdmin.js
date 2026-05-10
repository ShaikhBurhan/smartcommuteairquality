import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-commute');
        console.log('Connected to MongoDB for seeding...');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@smartcommute.com' });

        if (existingAdmin) {
            console.log('✓ Admin account already exists:');
            console.log(`  Email: ${existingAdmin.email}`);
            console.log('  Skipping seed.');
        } else {
            const admin = await Admin.create({
                name: 'System Administrator',
                email: 'admin@smartcommute.com',
                password: 'Admin@123',
                role: 'superadmin',
            });

            console.log('✓ Admin account created successfully!');
            console.log(`  Name:  ${admin.name}`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Password: Admin@123`);
            console.log(`  Role:  ${admin.role}`);
        }

        await mongoose.disconnect();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    }
};

seedAdmin();
