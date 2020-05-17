// jshint esversion: 9
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

const dbCollection = process.env.DB_COLLECTION;
const dbConnectionType = process.env.DB_CONNECTION_TYPE;
let dbConnection = dbConnectionType == 'local' ? process.env.DB_LOCAL : process.env.DB_ONLINE;

dbConnection = dbConnection.replace('<PASSWORD>', process.env.PASSWORD);
dbConnection = dbConnection.replace('<DB_COLLECTION>', process.env.DB_COLLECTION);

console.log('%s\x1b[31m%s\x1b[0m%s', 'Connecting to ', dbConnectionType, ' database...',);

mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(
  () => console.log('\x1b[32m%s\x1b[0m', 'Database connection successful!'),
  (err) => {
    console.log('ERROR: Could not connect to database...\n', err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('%s\x1b[31m%s\x1b[0m','Skribbl custom words running on port ', port);
  console.log('%s\x1b[31m%s\x1b[0m%s', 'Running in ', process.env.NODE_ENV, ' mode');
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});





























// EOF
