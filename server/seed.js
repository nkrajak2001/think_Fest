import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import ParkingSlot from './models/ParkingSlot.js';
import Pricing from './models/Pricing.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected for seeding');

    // 1. SEED ADMIN
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 12);
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@campus.com',
        passwordHash,
        role: 'admin',
      });
      console.log('✅ Admin created successfully (admin@campus.com / admin123)');
    } else {
      console.log('✅ Admin already exists.');
    }

    // 2. SEED SLOTS
    const count = await ParkingSlot.countDocuments();
    if (count > 0) {
      console.log('⚠️ Deleting existing slots...');
      await ParkingSlot.deleteMany({});
    }

    console.log('🚗 Generating 50 new parking slots...');
    const slots = [];
    
    // We want 50 slots total:
    // 35 Regular, 5 EV, 5 VIP, 5 Handicap
    
    // Floor G (Ground) - 20 slots (VIP and Handicap usually here)
    for (let i = 1; i <= 20; i++) {
      let type = 'regular';
      if (i <= 5) type = 'handicap'; // First 5 on Ground for accessibility
      else if (i <= 10) type = 'vip'; // Next 5 for VIP
      
      slots.push({
        slotNumber: `G-${i.toString().padStart(3, '0')}`, // G-001 to G-020
        type,
        floor: 'G',
        section: i <= 10 ? 'A' : 'B'
      });
    }

    // Floor 1 - 30 slots (Regular and EV)
    for (let i = 1; i <= 30; i++) {
      let type = 'regular';
      if (i <= 5) type = 'ev'; // 5 EV charging spots
      
      slots.push({
        slotNumber: `1-${i.toString().padStart(3, '0')}`, // 1-001 to 1-030
        type,
        floor: '1',
        section: i <= 15 ? 'C' : 'D'
      });
    }

    await ParkingSlot.insertMany(slots);
    console.log('✅ Successfully seeded 50 slots:');
    console.log('   - 35 Regular');
    console.log('   - 5 Handicap (G-001 to G-005)');
    console.log('   - 5 VIP (G-006 to G-010)');
    console.log('   - 5 EV (1-001 to 1-005)');

    // 3. SEED PRICING
    const pricingCount = await Pricing.countDocuments();
    if (pricingCount === 0) {
      await Pricing.insertMany([
        { slotType: 'regular', hourlyRate: 5, minCharge: 1, isActive: true },
        { slotType: 'ev', hourlyRate: 8, minCharge: 1, isActive: true },
        { slotType: 'handicap', hourlyRate: 4, minCharge: 1, isActive: true },
        { slotType: 'vip', hourlyRate: 12, minCharge: 1, isActive: true },
      ]);
      console.log('✅ Default pricing seeded (Regular ₹5, EV ₹8, Handicap ₹4, VIP ₹12)');
    } else {
      console.log('✅ Pricing already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();

