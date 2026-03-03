import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected for seeding');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin123', 12);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@campus.com',
      passwordHash,
      role: 'admin',
    });

    console.log('Admin created successfully');
    console.log('  Email:', admin.email);
    console.log('  Password: admin123');
    console.log('  Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
