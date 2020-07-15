// jshint esversion: 9
// Node/npm modules
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const term = require('terminal-kit').terminal;

// Exception safety net
// Must be called before app.js
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Must be called before app.js if using process.env in app.js
dotenv.config({path: './config.env'});

const app = require('./app');

// Get current app info
const appInfo = require(__dirname + '/package.json');

// Get database info
const dbCluster = process.env.DB_CLUSTER;
const dbName = process.env.DB_NAME;
const dbUser = process.env.USERNAME;

// Get database URL for mongoose connection
const dbConnectionType = process.env.DB_CONNECTION_TYPE;
let dbConnection = dbConnectionType == 'local' ? process.env.DB_LOCAL : process.env.DB_ONLINE;

// Replace database password and database collection name within database
// connection URL
dbConnection = dbConnection.replace('<DB_CLUSTER>', dbCluster);
dbConnection = dbConnection.replace('<DB_NAME>', dbName);
dbConnection = dbConnection.replace('<PASSWORD>', process.env.PASSWORD);
dbConnection = dbConnection.replace('<USERNAME>', dbUser);

// Print a time stamp and the database connection information on server start
// or restart
term(
  '\n^!TIMESTAMP: ^r '+
  Date(Date.now()).toString()
);


// Attempt to connect to the database using mongoose then log connection success/failure data
mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(
  () => {
    term(
      `\nDatabase: ^r${dbName}^:`+
      `\nUser: ^r${dbUser}^:`+
      `\nCluster: ^r${dbCluster}^:`+
      `\nConnection Type: ^r${dbConnectionType}^:`+
      `\nConnection URL: ^r${dbConnection}\n\n`
    );
  },
  (err) => {
    term(
      '\n^#^W^rERROR: ^kCould not connect to database...'+
      '                              ^:\n'+
      `${err}\n`
    );
  });

// Start server on specified port. Default to port 3000 if none specified
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  term(
    `\nApp: ^r${appInfo.name} ^:\nPort: ^r${port}^:`+
    `\nVersion: ^r${appInfo.version}^:`+
    `\nMode: ^r${process.env.NODE_ENV.toUpperCase()}`
  );
});

// Safety net for unexpected errors
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// Safety net for segmentation fault
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});





























// EOF
