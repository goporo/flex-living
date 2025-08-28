const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/reviews.db');
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          reject(err);
        } else {
          console.log('📊 Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          sourceId TEXT,
          source TEXT,
          propertyId TEXT,
          propertyName TEXT,
          guestName TEXT,
          reviewText TEXT,
          rating_overall REAL,
          rating_cleanliness REAL,
          rating_communication REAL,
          rating_location REAL,
          rating_value REAL,
          submittedAt TEXT,
          status TEXT,
          channel TEXT,
          type TEXT,
          approvedBy TEXT,
          approvedAt TEXT,
          rejectedBy TEXT,
          rejectedAt TEXT,
          rejectionReason TEXT,
          metadata TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Error creating table:', err.message);
          reject(err);
        } else {
          console.log('✅ Reviews table ready');
          resolve();
        }
      });
    });
  }

  async saveReviews(reviews) {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT OR REPLACE INTO reviews (
          id, sourceId, source, propertyId, propertyName, guestName, reviewText,
          rating_overall, rating_cleanliness, rating_communication, rating_location, rating_value,
          submittedAt, status, channel, type, approvedBy, approvedAt, rejectedBy, rejectedAt,
          rejectionReason, metadata, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const stmt = this.db.prepare(insertSQL);
      
      let completed = 0;
      const total = reviews.length;

      reviews.forEach(review => {
        const data = typeof review.toManagerView === 'function' ? review.toManagerView() : review;
        
        stmt.run([
          data.id,
          data.sourceId,
          data.source,
          data.propertyId,
          data.propertyName,
          data.guestName,
          data.reviewText,
          data.rating?.overall || null,
          data.rating?.cleanliness || null,
          data.rating?.communication || null,
          data.rating?.location || null,
          data.rating?.value || null,
          data.submittedAt,
          data.status,
          data.channel,
          data.type,
          data.approvedBy,
          data.approvedAt,
          data.rejectedBy,
          data.rejectedAt,
          data.rejectionReason,
          JSON.stringify(data.metadata || {}),
        ], function(err) {
          if (err) {
            console.error('❌ Error inserting review:', err.message);
          }
          
          completed++;
          if (completed === total) {
            stmt.finalize();
            console.log(`💾 Saved ${total} reviews to SQLite database`);
            resolve();
          }
        });
      });

      if (total === 0) {
        stmt.finalize();
        resolve();
      }
    });
  }

  async loadReviews() {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const selectSQL = `SELECT * FROM reviews ORDER BY updatedAt DESC`;
      
      this.db.all(selectSQL, [], (err, rows) => {
        if (err) {
          console.error('❌ Error loading reviews:', err.message);
          reject(err);
        } else {
          const reviews = rows.map(row => ({
            id: row.id,
            sourceId: row.sourceId,
            source: row.source,
            propertyId: row.propertyId,
            propertyName: row.propertyName,
            guestName: row.guestName,
            reviewText: row.reviewText,
            rating: {
              overall: row.rating_overall,
              cleanliness: row.rating_cleanliness,
              communication: row.rating_communication,
              location: row.rating_location,
              value: row.rating_value
            },
            submittedAt: row.submittedAt,
            status: row.status,
            channel: row.channel,
            type: row.type,
            approvedBy: row.approvedBy,
            approvedAt: row.approvedAt,
            rejectedBy: row.rejectedBy,
            rejectedAt: row.rejectedAt,
            rejectionReason: row.rejectionReason,
            metadata: JSON.parse(row.metadata || '{}'),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          }));
          
          console.log(`📂 Loaded ${reviews.length} reviews from SQLite database`);
          resolve(reviews);
        }
      });
    });
  }

  async clearReviews() {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM reviews', [], function(err) {
        if (err) {
          console.error('❌ Error clearing reviews:', err.message);
          reject(err);
        } else {
          console.log('🗑️ Cleared all reviews from SQLite database');
          resolve();
        }
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('📊 Database connection closed');
          }
          resolve();
        });
      });
    }
  }
}

module.exports = new SQLiteService();
