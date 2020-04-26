// jshint esversion: 9
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handledDuplicateFieldDB = err => {
  const message = `Duplicate word: '${err.keyValue.word}'. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTValidationError = () => {
  const message = 'Invalid token. Please login again';
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
    let error = {...err};

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handledDuplicateFieldDB(error);
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
