import { GoogleGenerativeAI } from '@google/generative-ai';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// General Chat for Users
export const generalChat = async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const systemInstruction = `You are a helpful AI Assistant for the 'Smart Campus Parking' system. 
Your job is to assist users in finding parking, understanding how to book a slot, and explaining pricing.
Keep your answers concise, friendly, and formatted in Markdown.
General System Info:
- Users can book a parking slot which requires a vehicle number.
- Bookings expire if the user does not check-in within 15 minutes.
- The system supports different types of slots: regular, EV, handicap, and VIP.
- Once checked in, a session starts. Upon checkout, a bill is generated.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction 
    });

    const chat = model.startChat({
        history: history || []
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    console.error('General Chat Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process AI request' });
  }
};

// Admin Chat with Data Context
export const adminChat = async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Gather Live Database Context for Admin
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'available' });
    const bookedSlots = await ParkingSlot.countDocuments({ status: 'booked' });
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
    const totalUsers = await User.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'active'] } });
    
    // Revenue calculations (assuming Bill model has an 'amount' or 'totalAmount')
    // We'll just provide total Bills as a metric for simplicity, or sum amounts if possible.
    const totalBills = await Bill.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const systemInstruction = `You are an advanced Admin AI Assistant for the 'Smart Campus Parking' system.
Your job is to help the admin analyze system data, check system health, and answer queries regarding slots, bookings, and users.
You will be provided with live data context. Answer the admin's questions based primarily on this data. Format your response beautifully in Markdown.

LIVE SYSTEM DATA CONTEXT:
- Total Parking Slots: ${totalSlots}
- Available Slots: ${availableSlots}
- Booked Slots (Reserved): ${bookedSlots}
- Occupied Slots (Checked In): ${occupiedSlots}
- Total Registered Users: ${totalUsers}
- Active Bookings: ${activeBookings}
- Completed Bookings: ${completedBookings}
- Total Bills Generated: ${totalBills}

Analyze the prompt using this data when relevant.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction
    });

    const chat = model.startChat({
        history: history || []
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    console.error('Admin Chat Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process Admin AI request' });
  }
};
