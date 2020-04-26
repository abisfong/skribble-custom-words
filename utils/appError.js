// jshint esversion: 9
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode % 100 == 4 ? 'fail' : 'error';
    this.isOperational = true;

    // Makes sure that stack trace does not include trace of AppError calls
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
