const { runQuery, getQuery, allQuery } = require('../config/database');

class UserAnalytics {
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS user_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                totalBids INTEGER DEFAULT 0,
                wonBids INTEGER DEFAULT 0,
                lostBids INTEGER DEFAULT 0,
                averageWinAmount REAL DEFAULT 0,
                averageBidAmount REAL DEFAULT 0,
                winRate REAL DEFAULT 0,
                aggressivenessScore REAL DEFAULT 0,
                lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        try {
            await runQuery(sql);
            console.log('User analytics table created successfully');
        } catch (error) {
            console.error('Error creating user analytics table:', error);
        }
    }

    static async getUserAnalytics(userId) {
        const sql = 'SELECT * FROM user_analytics WHERE userId = ?';
        
        try {
            const analytics = await getQuery(sql, [userId]);
            return analytics || null;
        } catch (error) {
            console.error('Error getting user analytics:', error);
            return null;
        }
    }

    static async updateUserAnalytics(userId, wonBid = false, bidAmount = 0) {
        // First check if user analytics exists
        let analytics = await this.getUserAnalytics(userId);
        
        if (!analytics) {
            // Create new analytics record
            const insertSql = `
                INSERT INTO user_analytics (userId, totalBids, wonBids, lostBids, averageBidAmount, winRate, aggressivenessScore)
                VALUES (?, 1, ?, ?, ?, ?, ?)
            `;
            const wonBids = wonBid ? 1 : 0;
            const lostBids = wonBid ? 0 : 1;
            const winRate = wonBid ? 1.0 : 0.0;
            const aggressivenessScore = this.calculateAggressivenessScore(1, wonBids, bidAmount);
            
            await runQuery(insertSql, [userId, wonBids, lostBids, bidAmount, winRate, aggressivenessScore]);
        } else {
            // Update existing analytics
            const newTotalBids = analytics.totalBids + 1;
            const newWonBids = analytics.wonBids + (wonBid ? 1 : 0);
            const newLostBids = analytics.lostBids + (wonBid ? 0 : 1);
            const newWinRate = newTotalBids > 0 ? (newWonBids / newTotalBids) : 0;
            
            // Update average bid amount
            const newAverageBidAmount = ((analytics.averageBidAmount * analytics.totalBids) + bidAmount) / newTotalBids;
            
            // Calculate aggressiveness score (0-100)
            const aggressivenessScore = this.calculateAggressivenessScore(newTotalBids, newWonBids, bidAmount);
            
            const updateSql = `
                UPDATE user_analytics 
                SET totalBids = ?, wonBids = ?, lostBids = ?, averageBidAmount = ?, 
                    winRate = ?, aggressivenessScore = ?, lastUpdated = CURRENT_TIMESTAMP
                WHERE userId = ?
            `;
            
            await runQuery(updateSql, [newTotalBids, newWonBids, newLostBids, newAverageBidAmount, newWinRate, aggressivenessScore, userId]);
        }
        
        return await this.getUserAnalytics(userId);
    }

    static calculateAggressivenessScore(totalBids, wonBids, bidAmount) {
        if (totalBids === 0) return 50; // Neutral score for new users
        
        const winRate = wonBids / totalBids;
        
        // Aggressiveness factors:
        // 1. High win rate = less aggressive (more strategic)
        // 2. Low win rate = more aggressive (bidding higher to win)
        // 3. Bid amount relative to typical prices
        
        // Base aggressiveness from win rate (inverse relationship)
        let aggressiveness = (1 - winRate) * 100;
        
        // Adjust based on bid amount (higher bids = more aggressive)
        // This is simplified - in reality you'd compare to item category averages
        if (bidAmount > 10000) {
            aggressiveness += 10;
        } else if (bidAmount < 5000) {
            aggressiveness -= 10;
        }
        
        // Keep within 0-100 range
        return Math.max(0, Math.min(100, aggressiveness));
    }

    static async getBidRecommendation(userId, currentBid, predictedStartingPrice) {
        const analytics = await this.getUserAnalytics(userId);
        
        // New users get no recommendation
        if (!analytics || analytics.totalBids < 3) {
            return {
                showRecommendation: false,
                reason: 'Insufficient bidding history'
            };
        }
        
        const recommendation = this.calculateRecommendation(analytics, currentBid, predictedStartingPrice);
        return recommendation;
    }

    static calculateRecommendation(analytics, currentBid, predictedStartingPrice) {
        const { winRate, aggressivenessScore, averageBidAmount, wonBids, lostBids } = analytics;
        
        let recommendedBid = currentBid;
        let confidence = 0;
        let strategy = '';
        
        // Analyze user's bidding pattern
        if (winRate > 0.7) {
            // User is very successful - conservative approach
            strategy = 'conservative';
            recommendedBid = currentBid * 1.05; // 5% increase
            confidence = 85;
        } else if (winRate > 0.4) {
            // Moderate success - balanced approach
            strategy = 'balanced';
            recommendedBid = currentBid * 1.10; // 10% increase
            confidence = 70;
        } else {
            // Low win rate - more aggressive approach needed
            strategy = 'aggressive';
            recommendedBid = currentBid * 1.15; // 15% increase
            confidence = 60;
        }
        
        // Adjust based on aggressiveness score
        if (aggressivenessScore > 70) {
            // User is naturally aggressive - moderate the recommendation
            recommendedBid = currentBid * 1.08;
            strategy = 'moderated_aggressive';
        } else if (aggressivenessScore < 30) {
            // User is very conservative - encourage slightly higher bids
            recommendedBid = currentBid * 1.12;
            strategy = 'encouraged_conservative';
        }
        
        // Ensure bid is reasonable (not too high above starting price)
        const maxReasonableBid = predictedStartingPrice * 2;
        if (recommendedBid > maxReasonableBid) {
            recommendedBid = maxReasonableBid;
            confidence -= 20;
        }
        
        // Ensure minimum bid increment
        const minBid = currentBid + 100;
        if (recommendedBid < minBid) {
            recommendedBid = minBid;
        }
        
        return {
            showRecommendation: true,
            recommendedBid: Math.round(recommendedBid),
            confidence: Math.max(30, confidence),
            strategy: strategy,
            reasoning: this.generateReasoning(analytics, strategy),
            userStats: {
                totalBids: analytics.totalBids,
                wonBids: analytics.wonBids,
                lostBids: analytics.lostBids,
                winRate: Math.round(winRate * 100)
            }
        };
    }

    static generateReasoning(analytics, strategy) {
        const { winRate, aggressivenessScore } = analytics;
        const winPercentage = Math.round(winRate * 100);
        
        switch(strategy) {
            case 'conservative':
                return `Based on your ${winPercentage}% win rate, a conservative approach maintains your success rate.`;
            case 'balanced':
                return `Your ${winPercentage}% win rate suggests a balanced bidding strategy.`;
            case 'aggressive':
                return `With a ${winPercentage}% win rate, consider more aggressive bidding to improve results.`;
            case 'moderated_aggressive':
                return `You tend to bid aggressively. Moderating your approach could improve your ${winPercentage}% win rate.`;
            case 'encouraged_conservative':
                return `You're quite conservative. A slightly more aggressive approach might improve your ${winPercentage}% win rate.`;
            default:
                return `Personalized recommendation based on your bidding history.`;
        }
    }
}

module.exports = UserAnalytics;
