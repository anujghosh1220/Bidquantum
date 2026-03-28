# 🚀 BidQuantum - Intelligent Predictive Bidding Platform

A cutting-edge auction platform that uses machine learning to provide personalized bid recommendations based on user behavior patterns.

## ✨ Features

### 🧠 Intelligent Bidding System
- **Personalized Recommendations**: AI-powered bid suggestions based on user history
- **Win Probability Analysis**: Confidence scores for bid success
- **Behavioral Learning**: System learns from wins, losses, and bidding patterns
- **Smart Strategies**: Conservative, balanced, or aggressive approach recommendations

### 🎯 Core Auction Features
- **Real-time Bidding**: WebSocket-powered instant bid updates
- **User Analytics**: Track bidding performance and win rates
- **Live Statistics**: Real-time platform metrics
- **Top Seller Rankings**: Dynamic seller leaderboards
- **Responsive Gallery**: 5-column grid layout for optimal viewing

### 👥 User Management
- **Secure Authentication**: JWT-based login system
- **Role-based Access**: Admin and regular user permissions
- **Profile Management**: User settings and preferences
- **Bidding History**: Complete bid tracking and analytics

## 🛠 Technology Stack

### Frontend
- **React 19**: Modern React with latest features
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Responsive styling with animations

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite**: Lightweight database
- **WebSocket**: Real-time communication
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone and Setup**
```bash
cd "c:/Users/Anuj Ghosh/Documents/Project/project"
```

2. **Install Dependencies**
```bash
# Frontend dependencies
npm install --legacy-peer-deps

# Backend dependencies
cd backend
npm install
cd ..
```

3. **Start the Application**

**Option 1: One-Command Startup**
```bash
npm run start:all
```

**Option 2: Manual Startup**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

**Option 3: PowerShell Script**
```bash
.\start.ps1
```

**Option 4: Batch File**
```bash
start.bat
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🔐 Default Accounts

### Admin Account
- **Email**: admin@bidquantum.com
- **Password**: admin123
- **Features**: Full admin privileges, item management

### Test Users (with Analytics)

#### John Smith - Experienced User
- **Email**: john@example.com
- **Password**: password123
- **Profile**: 7 bids, 5 wins (71% win rate)
- **Recommendations**: Conservative strategy

#### Emma Wilson - New User  
- **Email**: emma@example.com
- **Password**: password123
- **Profile**: 2 bids, 1 win (50% win rate)
- **Recommendations**: None (insufficient data)

#### Mike Johnson - Aggressive User
- **Email**: mike@example.com
- **Password**: password123
- **Profile**: 7 bids, 2 wins (29% win rate)
- **Recommendations**: Aggressive strategy

## 📊 How the AI System Works

### For New Users (0-2 bids)
- ❌ **No recommendations** - System needs more data
- ✅ **Fair play** - Everyone starts without AI assistance

### For Experienced Users (3+ bids)
- ✅ **Personalized recommendations** based on:
  - Win rate analysis
  - Bid amount patterns
  - Aggressiveness scoring
  - Historical performance

### Recommendation Strategies
- **Conservative** (high win rate): Small bid increases
- **Balanced** (moderate win rate): Standard increases
- **Aggressive** (low win rate): Higher bids with moderation

## 🎮 Using the Platform

### 1. Browse Items
- Visit homepage to see featured items
- Use gallery for complete item listing
- Filter by categories

### 2. Place Bids
- Click "Bid" on any item
- Enter bid amount (must exceed current bid)
- Receive AI recommendations (if eligible)

### 3. Track Performance
- View bidding history
- Monitor win rate
- Check analytics dashboard

### 4. Admin Features
- Add/edit/delete items
- View platform statistics
- Manage user accounts

## 📁 Project Structure

```
project/
├── backend/
│   ├── config/database.js          # SQLite configuration
│   ├── models/                     # Data models (User, Item, Bid, Analytics)
│   ├── routes/                     # API routes
│   ├── scripts/                    # Database utilities
│   ├── server.js                   # Main server file
│   └── package.json
├── src/                           # Frontend source
│   ├── components/                 # React components
│   ├── gallery/                    # Gallery components
│   └── App.js                      # Main app component
├── public/                        # Static files
├── start.ps1                      # PowerShell startup script
├── start.bat                      # Batch startup script
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create item (admin)
- `DELETE /api/items/:id` - Delete item (admin)

### Bidding
- `POST /api/items/:id/bids` - Place bid
- `GET /api/items/:id/bids` - Get bid history

### Analytics
- `GET /api/analytics/recommendation/:userId/:itemId` - Get bid recommendation
- `GET /api/analytics/user/:userId` - Get user analytics
- `GET /api/statistics` - Get platform statistics
- `GET /api/top-sellers` - Get top sellers

## 🎨 Features Showcase

### Real-time Updates
- Instant bid notifications via WebSocket
- Live statistics updates
- Dynamic price changes

### Intelligent Recommendations
- Machine learning-based bid suggestions
- Confidence scoring system
- Personalized strategy recommendations

### User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CORS enabled

## 📈 Performance Metrics

- **Frontend**: React 19 with optimized rendering
- **Backend**: Express.js with efficient routing
- **Database**: SQLite for fast queries
- **Real-time**: WebSocket for instant updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced ML algorithms
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Social features integration

## 📞 Support

For support and questions:
- Check the documentation
- Review API endpoints
- Test with provided accounts

---

**BidQuantum** - Where Intelligence Meets Auction! 🚀
