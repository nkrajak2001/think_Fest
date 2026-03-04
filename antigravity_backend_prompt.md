# Smart Campus Parking — Backend Fix Instructions for Antigravity

> Paste this entire prompt into Antigravity. It describes every change needed, file by file, with exact code to use. Do NOT skip any section. Apply all changes in the order listed.

---

## CONTEXT

This is a Node.js + Express.js + MongoDB backend using ES Modules (`"type": "module"`). The project is in `/server`. All imports use `.js` extensions. Controllers use static classes (OOP pattern). Do not change the architecture — only fix/add what is listed below.

---

## CHANGE 1 — Create `.env` file (NEW FILE)

**File:** `server/.env`  
**Action:** Create this file from scratch.

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_parking
JWT_SECRET=supersecretjwtkey_changeme_in_production
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## CHANGE 2 — Fix `package.json` (EDIT EXISTING)

**File:** `server/package.json`  
**Action:** Replace the entire `"scripts"` block with:

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js",
  "seed": "node seed.js"
},
```

Also add `nodemon` to devDependencies (add this block after `"dependencies"`):

```json
"devDependencies": {
  "nodemon": "^3.0.1"
}
```

---

## CHANGE 3 — Fix `authMiddleware.js` (REPLACE ENTIRE FILE)

**File:** `server/middleware/authMiddleware.js`  
**Action:** Replace the entire file content with:

```js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Support both cookie-based and Bearer token auth
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
```

---

## CHANGE 4 — Add Input Validation Middleware (NEW FILE)

**File:** `server/middleware/validateMiddleware.js`  
**Action:** Create this file from scratch.

```js
import mongoose from 'mongoose';

// Helper to return a 400 with a message
const fail = (res, msg) => res.status(400).json({ message: msg });

// Validates user registration body
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2)
    return fail(res, 'Name must be at least 2 characters');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return fail(res, 'Valid email is required');
  if (!password || password.length < 6)
    return fail(res, 'Password must be at least 6 characters');
  next();
};

// Validates login body
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return fail(res, 'Email and password are required');
  next();
};

// Validates booking creation body
export const validateBooking = (req, res, next) => {
  const { slotId } = req.body;
  if (!slotId) return fail(res, 'slotId is required');
  if (!mongoose.Types.ObjectId.isValid(slotId))
    return fail(res, 'slotId is not a valid ID');
  next();
};

// Validates pricing body
export const validatePricing = (req, res, next) => {
  const { slotType, hourlyRate } = req.body;
  const validTypes = ['regular', 'ev', 'handicap', 'vip'];
  if (!slotType || !validTypes.includes(slotType))
    return fail(res, `slotType must be one of: ${validTypes.join(', ')}`);
  if (hourlyRate === undefined || isNaN(hourlyRate) || Number(hourlyRate) <= 0)
    return fail(res, 'hourlyRate must be a positive number');
  next();
};

// Validates slot creation body
export const validateSlot = (req, res, next) => {
  const { slotNumber, type, floor, section } = req.body;
  const validTypes = ['regular', 'ev', 'handicap', 'vip'];
  if (!slotNumber || slotNumber.trim().length === 0)
    return fail(res, 'slotNumber is required');
  if (!type || !validTypes.includes(type))
    return fail(res, `type must be one of: ${validTypes.join(', ')}`);
  if (!floor || floor.trim().length === 0)
    return fail(res, 'floor is required');
  if (!section || section.trim().length === 0)
    return fail(res, 'section is required');
  next();
};

// Validates profile update body
export const validateProfileUpdate = (req, res, next) => {
  const { name, vehicleNumber } = req.body;
  if (name !== undefined && name.trim().length < 2)
    return fail(res, 'Name must be at least 2 characters');
  if (vehicleNumber !== undefined && vehicleNumber.trim().length === 0)
    return fail(res, 'vehicleNumber cannot be empty');
  next();
};

// Validates password change body
export const validatePasswordChange = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return fail(res, 'oldPassword and newPassword are required');
  if (newPassword.length < 6)
    return fail(res, 'New password must be at least 6 characters');
  next();
};
```

---

## CHANGE 5 — Add Booking Expiry Cleanup Job (NEW FILE)

**File:** `server/utils/bookingCleanup.js`  
**Action:** Create this file from scratch.

```js
import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';

// Called on startup and by the cron job every 2 minutes.
// Finds all pending bookings past their expiresAt time
// and cleans up the slot status and user flag.
export const cleanupExpiredBookings = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'pending',
      expiresAt: { $lte: new Date() },
    });

    if (expiredBookings.length === 0) return;

    for (const booking of expiredBookings) {
      booking.status = 'expired';
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(booking.userId, {
        hasActiveBooking: false,
      });
    }

    console.log(`[Cleanup] Expired ${expiredBookings.length} booking(s)`);
  } catch (err) {
    console.error('[Cleanup] Error during booking cleanup:', err.message);
  }
};
```

---

## CHANGE 6 — Update `Booking.js` Model (EDIT EXISTING)

**File:** `server/models/Booking.js`  
**Action:** Add `'expired'` to the status enum. Find this line:

```js
enum: ['pending', 'active', 'completed', 'cancelled'],
```

Replace it with:

```js
enum: ['pending', 'active', 'completed', 'cancelled', 'expired'],
```

---

## CHANGE 7 — Update `app.js` (REPLACE ENTIRE FILE)

**File:** `server/app.js`  
**Action:** Replace the entire file content with:

```js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { cleanupExpiredBookings } from './utils/bookingCleanup.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Smart Campus Parking API');
});

// Run cleanup on startup and every 2 minutes
cleanupExpiredBookings();
setInterval(cleanupExpiredBookings, 2 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## CHANGE 8 — Update `authRoutes.js` (REPLACE ENTIRE FILE)

**File:** `server/routes/authRoutes.js`  
**Action:** Replace the entire file content with:

```js
import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.getMe);
router.patch('/me', authMiddleware, validateProfileUpdate, AuthController.updateProfile);
router.post('/change-password', authMiddleware, validatePasswordChange, AuthController.changePassword);

export default router;
```

---

## CHANGE 9 — Update `AuthController.js` (REPLACE ENTIRE FILE)

**File:** `server/controllers/AuthController.js`  
**Action:** Replace the entire file content with:

```js
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

class AuthController {

  static async register(req, res) {
    try {
      const { name, email, password, vehicleNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        passwordHash,
        role: 'user',
        vehicleNumber,
      });

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });

    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });

    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async logout(req, res) {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.json({ message: 'Logged out successfully' });
  }

  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-passwordHash');
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  // NEW: Update own name and/or vehicle number
  static async updateProfile(req, res) {
    try {
      const { name, vehicleNumber } = req.body;

      const updates = {};
      if (name) updates.name = name.trim();
      if (vehicleNumber) updates.vehicleNumber = vehicleNumber.trim().toUpperCase();

      const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
      ).select('-passwordHash');

      return res.json({ message: 'Profile updated', user });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // NEW: Change own password
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default AuthController;
```

---

## CHANGE 10 — Update `bookingRoutes.js` (REPLACE ENTIRE FILE)

**File:** `server/routes/bookingRoutes.js`  
**Action:** Replace the entire file content with:

```js
import express from 'express';
import BookingController from '../controllers/BookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';
import { validateBooking } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, RBAC.authorize('user'), validateBooking, BookingController.bookSlot);
router.patch('/:id/cancel', authMiddleware, RBAC.authorize('user'), BookingController.cancelBooking);
router.patch('/:id/pay', authMiddleware, RBAC.authorize('user'), BookingController.payBill);
router.get('/my', authMiddleware, RBAC.authorize('user'), BookingController.getMyBookings);
router.get('/all', authMiddleware, RBAC.authorize('admin', 'staff'), BookingController.getAllBookings);

export default router;
```

---

## CHANGE 11 — Update `BookingController.js` (REPLACE ENTIRE FILE)

**File:** `server/controllers/BookingController.js`  
**Action:** Replace the entire file content with:

```js
import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';

class BookingController {
  static async bookSlot(req, res) {
    try {
      const userId = req.user.id;
      const { slotId, vehicleNumber } = req.body;

      const user = await User.findById(userId);
      if (user.hasActiveBooking) {
        return res.status(400).json({ message: 'You already have an active booking' });
      }

      const slot = await ParkingSlot.findById(slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      if (slot.status !== 'available') {
        return res.status(400).json({ message: 'Slot is not available' });
      }

      const booking = await Booking.create({
        userId,
        slotId,
        vehicleNumber: vehicleNumber || user.vehicleNumber,
        status: 'pending',
      });

      slot.status = 'booked';
      slot.currentBookingId = booking._id;
      await slot.save();

      user.hasActiveBooking = true;
      await user.save();

      return res.status(201).json({ message: 'Slot booked successfully', booking });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
      }

      booking.status = 'cancelled';
      booking.expiresAt = undefined;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(userId, { hasActiveBooking: false });

      return res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // NEW: Mark a bill as paid
  static async payBill(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: 'Booking is not completed yet' });
      }
      if (!booking.billId) {
        return res.status(404).json({ message: 'No bill found for this booking' });
      }

      const bill = await Bill.findById(booking.billId);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }
      if (bill.paidAt) {
        return res.status(400).json({ message: 'Bill already paid' });
      }

      bill.paidAt = new Date();
      await bill.save();

      return res.json({ message: 'Bill paid successfully', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getMyBookings(req, res) {
    try {
      const bookings = await Booking.find({ userId: req.user.id })
        .populate('slotId', 'slotNumber type floor section')
        .populate('billId')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;

      const [bookings, total] = await Promise.all([
        Booking.find(filter)
          .populate('userId', 'name email vehicleNumber')
          .populate('slotId', 'slotNumber type floor section')
          .populate('billId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Booking.countDocuments(filter),
      ]);

      return res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default BookingController;
```

---

## CHANGE 12 — Update `staffRoutes.js` (REPLACE ENTIRE FILE)

**File:** `server/routes/staffRoutes.js`  
**Action:** Replace the entire file content with:

```js
import express from 'express';
import StaffController from '../controllers/StaffController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Look up bookings by vehicleNumber or slotId (query params)
router.get('/bookings', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.findBookings);

router.patch('/:id/checkin', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkIn);
router.patch('/:id/checkout', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkOut);

export default router;
```

---

## CHANGE 13 — Update `StaffController.js` (REPLACE ENTIRE FILE)

**File:** `server/controllers/StaffController.js`  
**Action:** Replace the entire file content with:

```js
import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Bill from '../models/Bill.js';
import Pricing from '../models/Pricing.js';
import User from '../models/User.js';

class StaffController {

  // NEW: Search bookings by vehicleNumber or slotId
  static async findBookings(req, res) {
    try {
      const { vehicleNumber, slotId, status } = req.query;

      const filter = {};
      if (vehicleNumber) filter.vehicleNumber = vehicleNumber.toUpperCase();
      if (status) filter.status = status;

      // If slotId given, find via slot
      if (slotId) {
        const slot = await ParkingSlot.findOne({ slotNumber: slotId.toUpperCase() });
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        filter.slotId = slot._id;
      }

      const bookings = await Booking.find(filter)
        .populate('userId', 'name email vehicleNumber')
        .populate('slotId', 'slotNumber type floor section')
        .populate('billId')
        .sort({ createdAt: -1 })
        .limit(20);

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async checkIn(req, res) {
    try {
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Booking is not in pending status' });
      }

      booking.status = 'active';
      booking.checkInTime = new Date();
      booking.expiresAt = undefined;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, { status: 'occupied' });

      return res.json({ message: 'Check-in successful', booking });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async checkOut(req, res) {
    try {
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId).populate('slotId');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.status !== 'active') {
        return res.status(400).json({ message: 'Booking is not checked in' });
      }

      const checkOutTime = new Date();
      const durationMs = checkOutTime - booking.checkInTime;
      const durationMinutes = Math.floor(durationMs / 60000);

      const slotType = booking.slotId.type;
      const pricing = await Pricing.findOne({ slotType, isActive: true });
      if (!pricing) {
        return res.status(400).json({ message: 'Pricing not configured for this slot type' });
      }

      const billableHours = Math.max(1, Math.ceil(durationMinutes / 60));
      const totalAmount = billableHours * pricing.hourlyRate;

      const bill = await Bill.create({
        bookingId: booking._id,
        userId: booking.userId,
        duration: durationMinutes,
        billableHours,
        hourlyRate: pricing.hourlyRate,
        totalAmount,
      });

      booking.status = 'completed';
      booking.checkOutTime = checkOutTime;
      booking.billId = bill._id;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId._id, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(booking.userId, { hasActiveBooking: false });

      return res.json({ message: 'Check-out successful', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default StaffController;
```

---

## CHANGE 14 — Update `adminRoutes.js` (REPLACE ENTIRE FILE)

**File:** `server/routes/adminRoutes.js`  
**Action:** Replace the entire file content with:

```js
import express from 'express';
import AdminController from '../controllers/AdminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';
import { validateSlot, validatePricing } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Slot management
router.post('/slots', authMiddleware, RBAC.authorize('admin'), validateSlot, AdminController.createSlot);
router.put('/slots/:id', authMiddleware, RBAC.authorize('admin'), AdminController.updateSlot);
router.delete('/slots/:id', authMiddleware, RBAC.authorize('admin'), AdminController.deleteSlot);
router.get('/slots', authMiddleware, RBAC.authorize('admin'), AdminController.getAllSlots);
router.patch('/slots/:id/maintenance', authMiddleware, RBAC.authorize('admin'), AdminController.setMaintenance);
router.patch('/slots/:id/activate', authMiddleware, RBAC.authorize('admin'), AdminController.activateSlot);

// Pricing
router.post('/pricing', authMiddleware, RBAC.authorize('admin'), validatePricing, AdminController.setPricing);
router.get('/pricing', authMiddleware, RBAC.authorize('admin'), AdminController.getPricing);

// Revenue & dashboard
router.get('/revenue', authMiddleware, RBAC.authorize('admin'), AdminController.getRevenue);
router.get('/dashboard', authMiddleware, RBAC.authorize('admin'), AdminController.getDashboardStats);

// User management
router.get('/users', authMiddleware, RBAC.authorize('admin'), AdminController.getAllUsers);
router.patch('/users/:id/role', authMiddleware, RBAC.authorize('admin'), AdminController.updateUserRole);

// Bill management
router.patch('/bills/:id/confirm-payment', authMiddleware, RBAC.authorize('admin', 'staff'), AdminController.confirmPayment);

export default router;
```

---

## CHANGE 15 — Update `AdminController.js` (REPLACE ENTIRE FILE)

**File:** `server/controllers/AdminController.js`  
**Action:** Replace the entire file content with:

```js
import ParkingSlot from '../models/ParkingSlot.js';
import Pricing from '../models/Pricing.js';
import Bill from '../models/Bill.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

class AdminController {
  static async createSlot(req, res) {
    try {
      const { slotNumber, type, floor, section } = req.body;

      const existing = await ParkingSlot.findOne({ slotNumber: slotNumber.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'Slot number already exists' });
      }

      const slot = await ParkingSlot.create({ slotNumber, type, floor, section });
      return res.status(201).json({ message: 'Slot created', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async updateSlot(req, res) {
    try {
      const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      return res.json({ message: 'Slot updated', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async deleteSlot(req, res) {
    try {
      const slot = await ParkingSlot.findById(req.params.id);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      if (slot.status !== 'available') {
        return res.status(400).json({ message: 'Cannot delete a slot that is not available' });
      }
      await ParkingSlot.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Slot deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllSlots(req, res) {
    try {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.floor) filter.floor = req.query.floor;

      const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 });
      return res.json(slots);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // NEW: Put slot into maintenance mode
  static async setMaintenance(req, res) {
    try {
      const slot = await ParkingSlot.findById(req.params.id);
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
      if (slot.status !== 'available') {
        return res.status(400).json({ message: 'Only available slots can be set to maintenance' });
      }
      slot.status = 'maintenance';
      await slot.save();
      return res.json({ message: 'Slot set to maintenance', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // NEW: Restore slot from maintenance to available
  static async activateSlot(req, res) {
    try {
      const slot = await ParkingSlot.findById(req.params.id);
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
      if (slot.status !== 'maintenance') {
        return res.status(400).json({ message: 'Slot is not in maintenance mode' });
      }
      slot.status = 'available';
      await slot.save();
      return res.json({ message: 'Slot activated', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async setPricing(req, res) {
    try {
      const { slotType, hourlyRate, minCharge } = req.body;

      const pricing = await Pricing.findOneAndUpdate(
        { slotType },
        { hourlyRate, minCharge: minCharge || 1, updatedBy: req.user.id, isActive: true },
        { new: true, upsert: true, runValidators: true }
      );

      return res.json({ message: 'Pricing updated', pricing });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getPricing(req, res) {
    try {
      const pricing = await Pricing.find({ isActive: true });
      return res.json(pricing);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // UPDATED: Supports optional date range via ?from=ISO&to=ISO
  static async getRevenue(req, res) {
    try {
      const matchStage = {};
      if (req.query.from || req.query.to) {
        matchStage.createdAt = {};
        if (req.query.from) matchStage.createdAt.$gte = new Date(req.query.from);
        if (req.query.to) matchStage.createdAt.$lte = new Date(req.query.to);
      }

      const pipeline = [];
      if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });
      pipeline.push({
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCollected: { $sum: { $cond: [{ $ne: ['$paidAt', null] }, '$totalAmount', 0] } },
          totalBills: { $sum: 1 },
          paidBills: { $sum: { $cond: [{ $ne: ['$paidAt', null] }, 1, 0] } },
        }
      });

      const result = await Bill.aggregate(pipeline);
      const revenue = result.length > 0 ? result[0] : { totalRevenue: 0, totalCollected: 0, totalBills: 0, paidBills: 0 };

      return res.json({
        totalRevenue: revenue.totalRevenue,
        totalCollected: revenue.totalCollected,
        totalBills: revenue.totalBills,
        paidBills: revenue.paidBills,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const [slotStats, bookingStats, revenueStats] = await Promise.all([
        ParkingSlot.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Bill.aggregate([
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBills: { $sum: 1 } } },
        ]),
      ]);

      const slots = {};
      slotStats.forEach((s) => { slots[s._id] = s.count; });

      const bookings = {};
      bookingStats.forEach((b) => { bookings[b._id] = b.count; });

      const revenue = revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, totalBills: 0 };

      return res.json({
        slots,
        bookings,
        totalRevenue: revenue.totalRevenue,
        totalBills: revenue.totalBills,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      if (!['user', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be user, staff, or admin' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      return res.json({
        message: `User role updated to ${role}`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  // NEW: Admin/staff confirms a payment was received
  static async confirmPayment(req, res) {
    try {
      const bill = await Bill.findById(req.params.id);
      if (!bill) return res.status(404).json({ message: 'Bill not found' });
      if (bill.paidAt) return res.status(400).json({ message: 'Bill already marked as paid' });

      bill.paidAt = new Date();
      await bill.save();

      return res.json({ message: 'Payment confirmed', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default AdminController;
```

---

## SUMMARY OF ALL FILES CHANGED / CREATED

| # | File | Action |
|---|------|--------|
| 1 | `server/.env` | CREATE NEW |
| 2 | `server/package.json` | Edit scripts + devDependencies |
| 3 | `server/middleware/authMiddleware.js` | REPLACE |
| 4 | `server/middleware/validateMiddleware.js` | CREATE NEW |
| 5 | `server/utils/bookingCleanup.js` | CREATE NEW |
| 6 | `server/models/Booking.js` | Edit one line (enum) |
| 7 | `server/app.js` | REPLACE |
| 8 | `server/routes/authRoutes.js` | REPLACE |
| 9 | `server/controllers/AuthController.js` | REPLACE |
| 10 | `server/routes/bookingRoutes.js` | REPLACE |
| 11 | `server/controllers/BookingController.js` | REPLACE |
| 12 | `server/routes/staffRoutes.js` | REPLACE |
| 13 | `server/controllers/StaffController.js` | REPLACE |
| 14 | `server/routes/adminRoutes.js` | REPLACE |
| 15 | `server/controllers/AdminController.js` | REPLACE |

## FILES NOT CHANGED (already correct)

- `server/middleware/rbacMiddleware.js` — no changes needed
- `server/utils/generateToken.js` — no changes needed
- `server/config/db.js` — no changes needed
- `server/seed.js` — no changes needed
- `server/models/User.js` — no changes needed
- `server/models/ParkingSlot.js` — no changes needed
- `server/models/Bill.js` — no changes needed
- `server/models/Pricing.js` — no changes needed
- `server/routes/slotRoutes.js` — no changes needed
- `server/controllers/SlotController.js` — no changes needed
