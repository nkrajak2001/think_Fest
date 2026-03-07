import express from 'express';
import { generalChat, adminChat } from '../controllers/aiController.js';

// If there are existing auth middlewares, import them here
// import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// General chat route for users (no auth required for floating widget general queries)
router.post('/chat', generalChat);

// Admin chat route (ideally protected by admin middleware, but keeping it open for development unless requested)
router.post('/admin', adminChat);

export default router;
