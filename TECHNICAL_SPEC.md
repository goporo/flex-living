# Flex Living Reviews Dashboard - Technical Specification

## 🏗️ System Architecture

### Overview
The Reviews Dashboard consists of three main components:
1. **Backend API** - Node.js/Express server handling data integration and management
2. **Manager Dashboard** - React application for review management
3. **Public Review Display** - React components for customer-facing reviews

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hostaway API  │    │  Google Places  │    │   Mock Data     │
│                 │    │      API        │    │     System      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Backend API Server    │
                    │    (Express.js/Node.js)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │       Frontend App        │
                    │      (React/Vite)         │
                    └───────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
    ┌───────────▼───────────┐   │    ┌───────────▼───────────┐
    │  Manager Dashboard    │   │    │  Public Review Display │
    │   (Admin Interface)   │   │    │  (Customer Interface)  │
    └───────────────────────┘   │    └───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Property Pages      │
                    │  (Flex Living Style)  │
                    └───────────────────────┘
```

---

## 📊 Data Models & Schema

### Core Review Model
```typescript
interface Review {
  // Core identifiers
  id: string;                    // Unique review identifier
  sourceId: string;              // Original ID from source API
  source: 'hostaway' | 'google' | 'manual';
  
  // Property information
  propertyId: string;            // Internal property identifier
  propertyName: string;          // Display name for property
  
  // Review content
  guestName: string;             // Reviewer name
  reviewText: string;            // Review content
  rating: ReviewRating;          // Rating structure
  submittedAt: Date;             // Original submission date
  
  // Management fields
  status: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;             // Whether shown on public site
  approvedBy?: string;           // Manager who approved
  approvedAt?: Date;             // Approval timestamp
  
  // Metadata
  channel: string;               // booking channel (airbnb, booking.com, etc.)
  type: string;                  // review type from source
  metadata: ReviewMetadata;      // Additional source-specific data
}

interface ReviewRating {
  overall: number | null;        // Overall rating (1-10 or 1-5)
  categories: {
    cleanliness?: number;
    communication?: number;
    location?: number;
    value?: number;
    checkin?: number;
    accuracy?: number;
  };
}

interface ReviewMetadata {
  responseRequired: boolean;
  flaggedForReview: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  sourceData: any;              // Original API response
}
```

### Property Performance Model
```typescript
interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  metrics: {
    totalReviews: number;
    averageRating: number;
    approvedReviews: number;
    pendingReviews: number;
    rejectedReviews: number;
    lastReviewDate: Date;
    categoryRatings: {
      cleanliness: number;
      communication: number;
      location: number;
      value: number;
    };
    channelBreakdown: {
      [channel: string]: {
        count: number;
        averageRating: number;
      };
    };
    monthlyTrend: {
      month: string;
      reviewCount: number;
      averageRating: number;
    }[];
  };
}
```

---

## 🔌 API Specification

### Authentication
```http
Headers:
  Authorization: Bearer {jwt_token}  // If implementing auth
  X-API-Key: {api_key}              // For service-to-service
```

### Core Endpoints

#### 1. Hostaway Integration
```http
GET /api/reviews/hostaway
Description: Fetch and normalize reviews from Hostaway API
Response: {
  success: boolean;
  data: Review[];
  meta: {
    total: number;
    page: number;
    lastSync: Date;
  };
}
```

#### 2. Review Management
```http
GET /api/reviews
Description: Get reviews with filtering and pagination
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - propertyId: string[]
  - status: string[]
  - rating: string (e.g., "4-5")
  - dateFrom: string (ISO date)
  - dateTo: string (ISO date)
  - channel: string[]
  - search: string

POST /api/reviews/:id/approve
Description: Approve review for public display
Body: {
  approvedBy: string;
  notes?: string;
}

POST /api/reviews/:id/reject
Description: Reject review from public display
Body: {
  reason: string;
  rejectedBy: string;
}

POST /api/reviews/bulk-action
Description: Bulk approve/reject reviews
Body: {
  reviewIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
  actionBy: string;
}
```

#### 3. Public Display
```http
GET /api/reviews/public/:propertyId
Description: Get approved reviews for public display
Query Parameters:
  - page: number
  - limit: number
  - sortBy: 'date' | 'rating'
  - sortOrder: 'asc' | 'desc'
  - minRating: number

Response: {
  success: boolean;
  data: PublicReview[];
  meta: {
    total: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}
```

#### 4. Analytics
```http
GET /api/analytics/properties
Description: Get property performance analytics

GET /api/analytics/trends
Description: Get review trends and insights
Query Parameters:
  - period: 'week' | 'month' | 'quarter' | 'year'
  - propertyId: string[]
```

---

