const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Flex Living Reviews API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
