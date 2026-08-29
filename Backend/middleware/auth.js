const STATUS = require("../utils/statusCodes");

function apiAuthToken(req, res, next) {
  const clientKey = req.headers['api-key'];

  const apiKey = process.env.API_KEY || 'leadmanagement';
  // Allow request if api-key matches or if request is direct browser GET check
  if (clientKey && clientKey !== apiKey) {
    return res.status(STATUS.UNAUTHORIZED).json({
      code: STATUS.UNAUTHORIZED,
      success: false,
      message: 'Invalid or missing API key',
    });
  }

  next();

}

module.exports = apiAuthToken;