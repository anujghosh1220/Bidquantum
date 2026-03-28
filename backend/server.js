const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import SQLite database and models
const { testConnection, runQuery, getQuery, allQuery } = require('./config/database');
const User = require('./models/User');
const Item = require('./models/Item');
const Bid = require('./models/Bid');
const UserAnalytics = require('./models/UserAnalytics');
const analyticsRouter = require('./routes/analyticsRoutes');

// Enhanced error logging
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
});

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        console.log('Uploads directory created successfully');
    } else {
        fs.chmodSync(uploadsDir, 0o755);
    }
    
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('Uploads directory is writable');
    
    app.use('/uploads', express.static(uploadsDir));
} catch (error) {
    console.error('Failed to set up uploads directory:', error);
    process.exit(1);
}

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Initialize database and start server
const startServer = async () => {
    try {
        await testConnection();
        
        // Initialize user analytics table
        await UserAnalytics.createTable();
        
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// WebSocket setup for real-time bidding
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'BID_PLACED') {
                // Broadcast new bid to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// API Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, city, phone } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const userId = await User.create({
            username,
            email,
            password: hashedPassword,
            city,
            phone
        });
        
        // Generate JWT token
        const token = jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: userId, username, email, city, phone }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                city: user.city,
                phone: user.phone,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Item routes
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.findAll();
        res.json(items);
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/items', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, sellerName, itemDetail, currentBid, productDetails, predictedStartingPrice } = req.body;
        
        const itemData = {
            title,
            sellerName,
            itemDetail,
            currentBid: parseFloat(currentBid),
            productDetails,
            predictedStartingPrice: parseFloat(predictedStartingPrice),
            image: req.file ? `/uploads/${req.file.filename}` : null,
            sellerId: req.user.userId
        };
        
        const itemId = await Item.create(itemData);
        const item = await Item.findById(itemId);
        
        res.status(201).json(item);
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bid routes
app.get('/api/items/:itemId/bids', async (req, res) => {
    try {
        const bids = await Bid.findByItemId(req.params.itemId);
        res.json(bids);
    } catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/items/:itemId/bids', verifyToken, async (req, res) => {
    try {
        const { bidAmount } = req.body;
        const itemId = req.params.itemId;
        const userId = req.user.userId;
        
        // Get item details
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Validate bid amount
        if (parseFloat(bidAmount) <= parseFloat(item.currentBid)) {
            return res.status(400).json({ message: 'Bid amount must be higher than current bid' });
        }
        
        // Create bid
        const bidData = {
            itemId,
            userId,
            username: req.user.username,
            bidAmount: parseFloat(bidAmount)
        };
        
        const bidId = await Bid.create(bidData);
        
        // Update item's current bid
        await Item.updateCurrentBid(itemId, parseFloat(bidAmount));
        
        // Get updated item
        const updatedItem = await Item.findById(itemId);
        
        // Update user analytics (bid placed, but we don't know if won yet)
        await UserAnalytics.updateUserAnalytics(userId, false, parseFloat(bidAmount));
        
        // Broadcast bid update via WebSocket
        const bidUpdate = {
            type: 'BID_PLACED',
            itemId,
            bidAmount: parseFloat(bidAmount),
            username: req.user.username,
            currentBid: parseFloat(bidAmount)
        };
        
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(bidUpdate));
            }
        });
        
        res.status(201).json({
            message: 'Bid placed successfully',
            bid: { id: bidId, ...bidData },
            item: updatedItem
        });
    } catch (error) {
        console.error('Place bid error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User routes
app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:userId/items', verifyToken, async (req, res) => {
    try {
        const items = await Item.findBySellerId(req.params.userId);
        res.json(items);
    } catch (error) {
        console.error('Get user items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Analytics routes
app.use('/api/analytics', analyticsRouter);

// Statistics endpoint
app.get('/api/statistics', async (req, res) => {
    try {
        const totalItems = await allQuery('SELECT COUNT(*) as count FROM items');
        const totalBids = await allQuery('SELECT COUNT(*) as count FROM bids');
        const totalUsers = await allQuery('SELECT COUNT(*) as count FROM users');
        const totalEarnings = await allQuery('SELECT SUM(bidAmount) as total FROM bids');
        const activeItems = await allQuery('SELECT COUNT(*) as count FROM items WHERE currentBid > 0');
        
        const stats = {
            itemsSold: totalItems[0]?.count || 0,
            itemsPending: activeItems[0]?.count || 0,
            totalBids: totalBids[0]?.count || 0,
            totalUsers: totalUsers[0]?.count || 0,
            totalEarnings: totalEarnings[0]?.total || 0,
            itemsCancelled: 0, // We can implement this later if needed
            itemsDelivered: totalItems[0]?.count || 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Top sellers endpoint
app.get('/api/top-sellers', async (req, res) => {
    try {
        const topSellers = await allQuery(`
            SELECT 
                u.id,
                u.username,
                u.email,
                COUNT(i.id) as itemsListed,
                COALESCE(SUM(i.currentBid), 0) as totalValue
            FROM users u
            LEFT JOIN items i ON u.id = i.sellerId
            GROUP BY u.id, u.username, u.email
            HAVING itemsListed > 0
            ORDER BY totalValue DESC, itemsListed DESC
            LIMIT 5
        `);
        
        const sellers = topSellers.map((seller, index) => ({
            id: seller.id,
            seller_name: seller.username,
            username: `@${seller.username.toLowerCase().replace(/\s/g, '')}`,
            itemsListed: seller.itemsListed,
            totalValue: seller.totalValue,
            imgSrc: `https://picsum.photos/seed/${seller.username}/50/50.jpg`
        }));
        
        res.json(sellers);
    } catch (error) {
        console.error('Get top sellers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
startServer();
