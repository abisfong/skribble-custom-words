// jshint esversion: 9
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyError = err => {
  const errValue = Object.values(err.keyValue)[0];
  const message = `'${errValue}' is taken`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = errors.join('.\n');
  return new AppError(message, 400);
};

const handleJWTValidationError = () => {
  const message = 'Invalid token. Please login again';
  return new AppError(message, 401);
};

const handleJWTExpireError = () => {
  const message = 'Token expired. Please login again';
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

  // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('----------------- INTERNAL ERROR -----------------\n', 'err: ', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong on our end!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // make copy of err object
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;

    if(error.code === 11000) {
      error = handleDuplicateKeyError(error);
    }

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTValidationError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpireError();
    }

    sendErrorProd(error, res);
  }
};


























// EOF
