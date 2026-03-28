const { runQuery } = require('../config/database_sqlite');
const UserAnalytics = require('../models/UserAnalytics');

const testUsers = [
    {
        userId: 1, // John Smith - Experienced user with good win rate
        bids: [
            { wonBid: true, bidAmount: 12000 },
            { wonBid: true, bidAmount: 8500 },
            { wonBid: false, bidAmount: 15000 },
            { wonBid: true, bidAmount: 9200 },
            { wonBid: true, bidAmount: 11000 },
            { wonBid: false, bidAmount: 13500 },
            { wonBid: true, bidAmount: 10500 }
        ]
    },
    {
        userId: 2, // Emma Wilson - New user with few bids
        bids: [
            { wonBid: false, bidAmount: 8000 },
            { wonBid: true, bidAmount: 7500 }
        ]
    },
    {
        userId: 3, // Mike Johnson - Aggressive bidder with low win rate
        bids: [
            { wonBid: false, bidAmount: 18000 },
            { wonBid: false, bidAmount: 22000 },
            { wonBid: true, bidAmount: 16000 },
            { wonBid: false, bidAmount: 25000 },
            { wonBid: false, bidAmount: 19000 },
            { wonBid: true, bidAmount: 21000 },
            { wonBid: false, bidAmount: 17000 }
        ]
    }
];

async function populateUserAnalytics() {
    try {
        console.log('Populating user analytics for testing...');
        
        for (const user of testUsers) {
            console.log(`Processing user ${user.userId}...`);
            
            // Clear existing analytics for this user
            await runQuery('DELETE FROM user_analytics WHERE userId = ?', [user.userId]);
            
            // Add each bid
            for (const bid of user.bids) {
                await UserAnalytics.updateUserAnalytics(user.userId, bid.wonBid, bid.bidAmount);
            }
            
            // Get final analytics
            const analytics = await UserAnalytics.getUserAnalytics(user.userId);
            console.log(`User ${user.userId} analytics:`, {
                totalBids: analytics.totalBids,
                wonBids: analytics.wonBids,
                lostBids: analytics.lostBids,
                winRate: Math.round(analytics.winRate * 100) + '%',
                aggressivenessScore: Math.round(analytics.aggressivenessScore)
            });
        }
        
        console.log('User analytics populated successfully!');
        console.log('\nTest scenarios:');
        console.log('- User 1: 7 bids, 5 wins (71% win rate) - Conservative strategy');
        console.log('- User 2: 2 bids, 1 win (50% win rate) - New user (no recommendations)');
        console.log('- User 3: 7 bids, 2 wins (29% win rate) - Aggressive strategy');
        
    } catch (error) {
        console.error('Error populating user analytics:', error);
    } finally {
        process.exit(0);
    }
}

populateUserAnalytics();
