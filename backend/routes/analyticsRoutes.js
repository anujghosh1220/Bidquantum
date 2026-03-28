const express = require('express');
const UserAnalytics = require('../models/UserAnalytics');
const Item = require('../models/Item');
const router = express.Router();

// Initialize analytics table
router.post('/init', async (req, res) => {
    try {
        await UserAnalytics.createTable();
        res.json({ message: 'User analytics table initialized successfully' });
    } catch (error) {
        console.error('Error initializing analytics:', error);
        res.status(500).json({ message: 'Error initializing analytics' });
    }
});

// Get bid recommendation for a user on a specific item
router.get('/recommendation/:userId/:itemId', async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        
        // Get item details
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Get recommendation
        const recommendation = await UserAnalytics.getBidRecommendation(
            parseInt(userId), 
            parseFloat(item.currentBid),
            parseFloat(item.predictedStartingPrice)
        );
        
        res.json(recommendation);
    } catch (error) {
        console.error('Error getting recommendation:', error);
        res.status(500).json({ message: 'Error getting recommendation' });
    }
});

// Get predictions for all items for a specific user
router.get('/predictions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get all items
        const items = await Item.getAll();
        
        // Get predictions for each item
        const predictions = {};
        for (const item of items) {
            try {
                const recommendation = await UserAnalytics.getBidRecommendation(
                    parseInt(userId), 
                    parseFloat(item.currentBid),
                    parseFloat(item.predictedStartingPrice)
                );
                predictions[item.id] = recommendation.recommendedBid;
            } catch (error) {
                // If no analytics data, use predicted starting price
                predictions[item.id] = item.predictedStartingPrice;
            }
        }
        
        res.json(predictions);
    } catch (error) {
        console.error('Error getting predictions:', error);
        res.status(500).json({ message: 'Error getting predictions' });
    }
});

// Get user analytics
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const analytics = await UserAnalytics.getUserAnalytics(parseInt(userId));
        
        if (!analytics) {
            return res.json({ 
                message: 'No analytics data available',
                totalBids: 0,
                wonBids: 0,
                lostBids: 0,
                winRate: 0
            });
        }
        
        res.json(analytics);
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({ message: 'Error getting user analytics' });
    }
});

// Update user analytics after a bid
router.post('/update/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { wonBid = false, bidAmount = 0 } = req.body;
        
        const updatedAnalytics = await UserAnalytics.updateUserAnalytics(
            parseInt(userId), 
            wonBid, 
            parseFloat(bidAmount)
        );
        
        res.json(updatedAnalytics);
    } catch (error) {
        console.error('Error updating user analytics:', error);
        res.status(500).json({ message: 'Error updating user analytics' });
    }
});

// Get user bidding history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // This would require joining bids with items and determining wins/losses
        // For now, return basic analytics
        const analytics = await UserAnalytics.getUserAnalytics(parseInt(userId));
        
        if (!analytics) {
            return res.json({ history: [], message: 'No bidding history available' });
        }
        
        res.json({
            totalBids: analytics.totalBids,
            wonBids: analytics.wonBids,
            lostBids: analytics.lostBids,
            winRate: analytics.winRate,
            averageBidAmount: analytics.averageBidAmount,
            aggressivenessScore: analytics.aggressivenessScore
        });
    } catch (error) {
        console.error('Error getting bidding history:', error);
        res.status(500).json({ message: 'Error getting bidding history' });
    }
});

module.exports = router;
