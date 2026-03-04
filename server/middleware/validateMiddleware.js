import mongoose from 'mongoose';
    
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