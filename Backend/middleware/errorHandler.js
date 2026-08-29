const STATUS = require('../utils/statusCodes');

function errorHandler(err, req, res, next) {

    const statusCode = err.statusCode || STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({
    code: statusCode,
    success: false,
    message: message,
  });
}

module.exports = errorHandler;