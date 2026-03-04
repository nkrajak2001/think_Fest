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