const fs = require('fs').promises;
const path = require('path');

class FileStorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.reviewsFile = path.join(this.dataDir, 'reviews.json');
    this.metaFile = path.join(this.dataDir, 'meta.json');
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
  }

  async saveReviews(reviews) {
    try {
      await this.ensureDataDirectory();
      
      // Convert Review instances to plain objects for JSON storage
      const reviewData = reviews.map(review => {
        if (typeof review.toManagerView === 'function') {
          return review.toManagerView();
        }
        return review;
      });

      await fs.writeFile(this.reviewsFile, JSON.stringify(reviewData, null, 2));
      
      // Save metadata
      const meta = {
        lastUpdated: new Date().toISOString(),
        count: reviews.length,
        version: '1.0'
      };
      await fs.writeFile(this.metaFile, JSON.stringify(meta, null, 2));
      
      console.log(`💾 Saved ${reviews.length} reviews to file storage`);
      return true;
    } catch (error) {
      console.error('❌ Error saving reviews to file:', error.message);
      return false;
    }
  }

  async loadReviews() {
    try {
      await this.ensureDataDirectory();
      
      // Check if file exists
      try {
        await fs.access(this.reviewsFile);
      } catch (error) {
        console.log('📄 No existing reviews file found');
        return [];
      }

      const data = await fs.readFile(this.reviewsFile, 'utf8');
      const reviews = JSON.parse(data);
      
      console.log(`📂 Loaded ${reviews.length} reviews from file storage`);
      return reviews;
    } catch (error) {
      console.error('❌ Error loading reviews from file:', error.message);
      return [];
    }
  }

  async getMeta() {
    try {
      await this.ensureDataDirectory();
      
      try {
        await fs.access(this.metaFile);
      } catch (error) {
        return null;
      }

      const data = await fs.readFile(this.metaFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading meta from file:', error.message);
      return null;
    }
  }

  async clearReviews() {
    try {
      await fs.unlink(this.reviewsFile);
      await fs.unlink(this.metaFile);
      console.log('🗑️ Cleared reviews from file storage');
      return true;
    } catch (error) {
      console.log('📄 No files to clear');
      return true;
    }
  }

  async fileExists() {
    try {
      await fs.access(this.reviewsFile);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new FileStorageService();
