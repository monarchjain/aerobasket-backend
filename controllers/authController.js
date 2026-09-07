const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password });
    const token = generateToken(user._id);

    console.log(`New user registered: ${user.email} (id: ${user._id})`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    console.log(`User logged in: ${user.email} (id: ${user._id})`);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Forgot password / OTP flow ---

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Deliberately vague either way — never reveal whether an email exists
    // in the system. Same reasoning as login's generic error message.
    if (!user) {
      console.log(`Forgot password: no account for ${email} (not revealing this to client)`);
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent' });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();

    console.log(`OTP for ${email}: ${otp} (expires in 10 min)`);

    // TEMPORARY: returning the OTP in the response so we can test without
    // real email sending yet. REMOVE "otp" from this response once email
    // delivery is added — a real app must never do this.
    res.status(200).json({
      message: 'If that email exists, an OTP has been sent',
      otp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.otp !== otp) {
      console.log(`OTP verify failed for ${email}: wrong code`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (Date.now() > user.otpExpiry) {
      console.log(`OTP verify failed for ${email}: expired`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Correct — clear it immediately so it can't be reused, then issue a
    // short-lived, single-purpose token proving "this person verified their
    // OTP", instead of passing the OTP itself forward to the next screen.
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    console.log(`OTP verified for ${email}, reset token issued`);

    res.status(200).json({ message: 'OTP verified', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Reset session expired, please start again' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ message: 'Invalid reset session' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword; // pre-save hook re-hashes this automatically
    await user.save();

    console.log(`Password reset for ${user.email}`);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};