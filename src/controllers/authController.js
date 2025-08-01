const authService = require('../services/authService');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    res.status(201).json({
      message: 'User registered successfully! ✨',
      user,
      token
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration failed! 📝',
      message: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      message: 'Login successful! ✨',
      user,
      token
    });
  } catch (error) {
    res.status(401).json({
      error: 'Login failed! 🔐',
      message: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.status(200).json({
      message: 'Profile retrieved successfully! 👤',
      user
    });
  } catch (error) {
    res.status(404).json({
      error: 'Profile not found! 👤',
      message: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);

    res.status(200).json({
      message: 'Profile updated successfully! ✨',
      user
    });
  } catch (error) {
    res.status(400).json({
      error: 'Profile update failed! 📝',
      message: error.message
    });
  }
};

/**
 * Change user password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully! 🔐',
      ...result
    });
  } catch (error) {
    res.status(400).json({
      error: 'Password change failed! 🔐',
      message: error.message
    });
  }
};

/**
 * Refresh token (optional - for future use)
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    // This could be implemented for token refresh logic
    res.status(200).json({
      message: 'Token refresh endpoint! 🔄',
      note: 'Implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token refresh failed! 🔄',
      message: error.message
    });
  }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint can be used for logging purposes
    res.status(200).json({
      message: 'Logout successful! 👋',
      note: 'Please remove the token from client storage'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed! 👋',
      message: error.message
    });
  }
};

/**
 * Verify token validity
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
  try {
    // Token is already verified by auth middleware
    res.status(200).json({
      message: 'Token is valid! ✅',
      user: req.user
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token verification failed! 🔐',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  verifyToken
}; 