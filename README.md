# Flex Living Reviews Dashboard

A comprehensive reviews management system for Flex Living properties, featuring Hostaway API integration, manager dashboard, and public review displays.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd flex-living-reviews
```

2. **Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Hostaway API credentials
npm start
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3002

## 📁 Project Structure

```
flex-living-reviews/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # API endpoint handlers
│   │   ├── services/        # Business logic & external APIs
│   │   ├── models/          # Data models and schemas
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Helper functions
│   ├── .env                 # Environment configuration
│   └── package.json
├── frontend/                # React/TypeScript dashboard
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React context providers
│   │   ├── services/        # API client services
│   │   ├── types/           # TypeScript type definitions
│   │   └── main.tsx         # Application entry point
│   ├── .env                 # Frontend environment config
│   └── package.json
└── docs/                    # Project documentation
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Hostaway API Configuration
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=your_api_key_here
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1

# Server Configuration
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:3002

# App Configuration
VITE_APP_NAME=Flex Living Reviews Dashboard
VITE_APP_VERSION=1.0.0
```

## 🌟 Features

### ✅ Implemented (Day 1-2)
- **Backend API Server**
  - Express.js server with TypeScript
  - Hostaway API integration with authentication
  - Review data normalization and validation
  - RESTful API endpoints with proper error handling
  - Mock data fallback system
  - Rate limiting and security middleware

- **Frontend Dashboard**
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - React Router for navigation
  - Context API for state management
  - Responsive dashboard layout
  - Property performance overview
  - Mock data integration

### 🚧 In Progress (Day 3)
- **Review Management Interface**
  - Advanced filtering and sorting
  - Bulk approve/reject functionality
  - Review status management
  - Search functionality

- **Public Review Display**
  - Property page integration
  - Guest-facing review interface
  - Responsive design
  - Review pagination

### 📋 Planned Features
- **Google Reviews Integration**
  - Google Places API research
  - Basic integration (if feasible)
  - Alternative solutions documentation

- **Advanced Analytics**
  - Performance trends and insights
  - Category breakdown analysis
  - Channel comparison charts
  - Export functionality

## 🔌 API Endpoints

### Reviews
- `GET /api/reviews/hostaway` - Fetch reviews from Hostaway API
- `GET /api/reviews` - Get filtered reviews for dashboard
- `POST /api/reviews/:id/approve` - Approve review for public display
- `POST /api/reviews/:id/reject` - Reject review from public display
- `POST /api/reviews/bulk-action` - Bulk approve/reject reviews
- `GET /api/reviews/public/:propertyId` - Get approved reviews for property

### Analytics
- `GET /api/analytics/properties` - Get property performance data
- `GET /api/analytics/trends` - Get review trends and insights

### System
- `GET /health` - Health check endpoint

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                     # Run unit tests
npm run test:integration     # Run integration tests
```

### Frontend Testing
```bash
cd frontend
npm test                     # Run component tests
npm run test:e2e            # Run end-to-end tests
```

### Manual API Testing
Use the provided Postman collection or test endpoints directly:
```bash
# Health check
curl http://localhost:3002/health

# Get Hostaway reviews
curl http://localhost:3002/api/reviews/hostaway
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Data Models

### Review Schema
```typescript
interface Review {
  id: string;
  sourceId: string;
  source: 'hostaway' | 'google' | 'manual';
  propertyId: string;
  propertyName: string;
  guestName: string;
  reviewText: string;
  rating: ReviewRating;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;
  channel: string;
  metadata: ReviewMetadata;
}
```

## 🔒 Security

- **API Security**
  - Rate limiting (100 requests/15 minutes)
  - Input validation with Joi
  - CORS configuration
  - Helmet.js security headers

- **Data Privacy**
  - Guest name anonymization options
  - Secure API key storage
  - Environment variable protection

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Node.js version (18+ required)
   - Verify environment variables in .env
   - Check port availability (3002)

2. **Frontend build errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all imports are correct

3. **API connection issues**
   - Confirm backend is running on correct port
   - Check CORS configuration
   - Verify API URLs in frontend .env

### Debug Mode
```bash
# Backend with debug logs
DEBUG=* npm start

# Frontend with source maps
npm run dev -- --debug
```

## 📈 Performance

### Optimization Features
- **Backend**
  - API response caching (15-minute TTL)
  - Request compression with gzip
  - Efficient data pagination
  - Database query optimization

- **Frontend**
  - Code splitting with React.lazy
  - Image optimization
  - Bundle size optimization
  - Virtual scrolling for large lists

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run linting and type checking
4. Submit pull request with description

### Code Standards
- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier + TypeScript strict mode
- **Commits**: Conventional commit format

## 📄 License

This project is proprietary to Flex Living. All rights reserved.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

## 🎯 Implementation Status

### Day 1: ✅ Backend Foundation
- [x] Express server setup
- [x] Hostaway API integration
- [x] Data normalization
- [x] Mock data system
- [x] API endpoints
- [x] Error handling

### Day 2: ✅ Frontend Dashboard
- [x] React application setup
- [x] Component architecture
- [x] State management
- [x] Dashboard layout
- [x] Property performance cards
- [x] API integration

### Day 3: 🚧 Advanced Features
- [ ] Review management interface
- [ ] Public review display
- [ ] Google Reviews exploration
- [ ] Performance optimization
- [ ] Final testing and documentation

**Current Status**: Backend and Frontend foundations are complete and running successfully. Ready to implement advanced features for Day 3.
