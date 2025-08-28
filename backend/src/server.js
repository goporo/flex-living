const app = require('./app');
const hostawayService = require('./services/hostawayService');
const dataService = require('./services/dataService');

const PORT = process.env.PORT || 3002;

// Initialize data on server startup
async function initializeData() {
  try {
    console.log('🔄 Initializing server data...');

    // Fetch reviews from Hostaway (will fall back to mock data if API fails)
    const reviews = await hostawayService.fetchReviews();

    // Save to local storage
    await dataService.saveReviews(reviews);

    console.log(`✅ Server initialized with ${reviews.length} reviews`);
  } catch (error) {
    console.error('❌ Error initializing server data:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Flex Living Reviews API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);

  // Initialize data after server starts
  await initializeData();
});
