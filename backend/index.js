const server = require('./src/server');
const { testConnection } = require('./src/config/database');

// Test database connection
testConnection()
  .then(() => {
    console.log('Task Manager API is running...');
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });