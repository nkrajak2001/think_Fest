const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

class AuthController {

  // REGISTER
  static async register(req, res) {
    try {
      const { name, email, password, vehicleNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        passwordHash,
        vehicleNumber
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }


  // LOGIN
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }


  // GET CURRENT USER
  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-passwordHash");

      return res.json(user);

    } catch (error) {
      return res.status(500).json({ message: "Server Error" });
    }
  }

}

module.exports = AuthController;