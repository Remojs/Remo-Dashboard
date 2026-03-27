require('dotenv').config();

const app = require('./src/app');
const { startMonitoringJob } = require('./src/jobs/monitoringJob');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  
  // Start cron jobs after server is ready
  startMonitoringJob();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
});
