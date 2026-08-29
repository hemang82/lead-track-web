const STATUS = require("../utils/statusCodes");

function apiAuthToken(req, res, next) {
  const clientKey = req.headers['api-key'];

  if (!clientKey || clientKey !== process.env.API_KEY) {
    return res.status(STATUS.UNAUTHORIZED).json({
      code: STATUS.UNAUTHORIZED,
      success: false,
      message: 'Invalid or missing API key',
    });
  }

  next();

}

module.exports = apiAuthToken;