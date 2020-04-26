// jshint esversion: 8
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const wordController = require('./controllers/wordController');
const wordRouter = require('./routes/wordRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security http headers
app.use(helmet());

// Print requests
app.use(morgan('dev'));

// creates rate limit object that limits requests from an IP to 100 per hour
// use limiter as middleware on /api route
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into eq.body
app.use(express.json( {limit: '10kb'} ));

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'substring'
  ]
}));

// Serveing static files
app.use(express.static(__dirname+'/public'));

// our own middleware
// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

// 2) ROUTES
app.use('/', wordRouter);

// 3)

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;































// EOF
