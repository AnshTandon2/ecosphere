// JWT-based authentication middleware

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const blacklist = new Set();

exports.logout = asyncHandler(async (req, res, next) => {
  if (req.token) {
    blacklist.add(req.token); // Store in Redis or DB in a real implementation
  }
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new ErrorResponse("User no longer exists", 401));
    }

    // Check if user changed password after token was issued
    if (
      user.passwordChangedAt &&
      decoded.iat < user.passwordChangedAt.getTime() / 1000
    ) {
      return next(
        new ErrorResponse(
          "User recently changed password. Please log in again",
          401
        )
      );
    }

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Rate limiting middleware
exports.rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};

// API key authentication for external services
exports.apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.header("X-API-Key");

  if (!apiKey) {
    return next(new ErrorResponse("API key is required", 401));
  }

  // Validate API key (implement your validation logic)
  const isValidApiKey = await validateApiKey(apiKey);
  if (!isValidApiKey) {
    return next(new ErrorResponse("Invalid API key", 401));
  }

  next();
});

module.exports = { protect, authorize, rateLimiter, apiKeyAuth };
