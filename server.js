// jshint esversion: 9
require('./utils/errorSafetyNet'); // catches uncaught and unhandled errors

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');

const dbCollection = process.env.DB_COLLECTION;
const dbConnectionType = process.env.DB_CONNECTION_TYPE;
let dbConnection = dbConnectionType == 'local' ? process.env.DB_LOCAL : process.env.DB_ONLINE;

dbConnection = dbConnection.replace('<PASSWORD>', process.env.PASSWORD);
dbConnection = dbConnection.replace('<DB_COLLECTION>', process.env.DB_COLLECTION);

if(dbConnectionType == 'local')
  console.log('Connecting to local database...');
else
  console.log('Connecting to online database...');

mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(
  () => console.log('Database connection successful!'),
  (err) => {
    console.log('ERROR: Could not connect to database...\n', err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Skribbl custom words running on port ' + port);
});





























// EOF
