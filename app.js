// jshint esversion: 8
const cookieParser = require('cookie-parser');
const device = require('express-device');
const express = require('express');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const userRouter = require('./routers/userRouter');
const wordRouter = require('./routers/wordRouter');
const viewRouter = require('./routers/viewRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Serving static files
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 1) GLOBAL MIDDLEWARES
// Set security http headers
app.use(helmet());

// Print requests
app.use(morgan('dev'));

// creates rate limit object that limits requests from an IP to 100 per hour
// use limiter as middleware on / route
const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in an hour!'
});
app.use('/', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Get device type
app.use(device.capture());

// Add device type to locals for pug
app.use((req, res, next) => {
  res.locals.deviceType = req.device.type;
  next();
});

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

// 2) ROUTES
app.use(favicon(path.join(__dirname, 'public/images/favicon.ico',)));
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/words', wordRouter);

// 3)

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;































// EOF
