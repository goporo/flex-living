const serverless = require('serverless-http');
const app = require('../src/app');

// Wrap the Express app for serverless deployment
const handler = serverless(app);

// Export the handler for Vercel
module.exports = handler;
