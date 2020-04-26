// jshint esversion: 9
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err  => {
  console.log('UNHANDLED EXCEPTION! Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
