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
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { cleanupExpiredBookings } from './utils/bookingCleanup.js';
dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Trust Render's reverse proxy so secure cookies work
if (isProd) app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

// Add production frontend origin from env var
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN.replace(/\/+$/, ''));
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
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
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Smart Campus Parking API');
});

cleanupExpiredBookings();
setInterval(cleanupExpiredBookings, 2 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});