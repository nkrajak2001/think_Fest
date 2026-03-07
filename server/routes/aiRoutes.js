import express from 'express';
import { generalChat, adminChat } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', generalChat);

router.post('/admin', adminChat);

export default router;
