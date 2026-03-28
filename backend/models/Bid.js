const { runQuery, getQuery, allQuery } = require('../config/database');

class Bid {
    static async create(bidData) {
        const { itemId, userId, username, bidAmount } = bidData;
        const sql = `
            INSERT INTO bids (itemId, userId, username, bidAmount)
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const result = await runQuery(sql, [itemId, userId, username, bidAmount]);
            return result.id;
        } catch (error) {
            throw error;
        }
    }

    static async findByItemId(itemId) {
        const sql = `
            SELECT b.*, u.username as bidderUsername 
            FROM bids b 
            LEFT JOIN users u ON b.userId = u.id 
            WHERE b.itemId = ? 
            ORDER BY b.bidAmount DESC, b.bidTime DESC
        `;
        
        try {
            const bids = await allQuery(sql, [itemId]);
            return bids;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        const sql = `
            SELECT b.*, i.title as itemTitle, i.image as itemImage 
            FROM bids b 
            LEFT JOIN items i ON b.itemId = i.id 
            WHERE b.userId = ? 
            ORDER BY b.bidTime DESC
        `;
        
        try {
            const bids = await allQuery(sql, [userId]);
            return bids;
        } catch (error) {
            throw error;
        }
    }

    static async findHighestBid(itemId) {
        const sql = `
            SELECT * FROM bids 
            WHERE itemId = ? 
            ORDER BY bidAmount DESC, b.bidTime DESC 
            LIMIT 1
        `;
        
        try {
            const bid = await getQuery(sql, [itemId]);
            return bid || null;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = `
            SELECT b.*, i.title as itemTitle, u.username as bidderUsername 
            FROM bids b 
            LEFT JOIN items i ON b.itemId = i.id 
            LEFT JOIN users u ON b.userId = u.id 
            ORDER BY b.bidTime DESC
        `;
        
        try {
            const bids = await allQuery(sql);
            return bids;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM bids WHERE id = ?';
        
        try {
            const result = await runQuery(sql, [id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Bid;
