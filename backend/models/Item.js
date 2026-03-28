const { runQuery, getQuery, allQuery } = require('../config/database');

class Item {
    static async create(itemData) {
        const { title, sellerName, itemDetail, currentBid, previousBid, productDetails, predictedStartingPrice, image, sellerId } = itemData;
        const sql = `
            INSERT INTO items (title, sellerName, itemDetail, currentBid, previousBid, productDetails, predictedStartingPrice, image, sellerId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const result = await runQuery(sql, [title, sellerName, itemDetail, currentBid, previousBid, productDetails, predictedStartingPrice, image, sellerId]);
            return result.id;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = `
            SELECT i.*, u.username as sellerUsername 
            FROM items i 
            LEFT JOIN users u ON i.sellerId = u.id 
            ORDER BY i.listDate DESC
        `;
        
        try {
            const items = await allQuery(sql);
            return items;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = `
            SELECT i.*, u.username as sellerUsername 
            FROM items i 
            LEFT JOIN users u ON i.sellerId = u.id 
            WHERE i.id = ?
        `;
        
        try {
            const item = await getQuery(sql, [id]);
            return item || null;
        } catch (error) {
            throw error;
        }
    }

    static async findBySellerId(sellerId) {
        const sql = 'SELECT * FROM items WHERE sellerId = ? ORDER BY listDate DESC';
        
        try {
            const items = await allQuery(sql, [sellerId]);
            return items;
        } catch (error) {
            throw error;
        }
    }

    static async updateCurrentBid(id, newBid) {
        const sql = `
            UPDATE items 
            SET currentBid = ?, previousBid = currentBid, updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        
        try {
            const result = await runQuery(sql, [newBid, id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateHearts(id, hearts) {
        const sql = 'UPDATE items SET hearts = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
        
        try {
            const result = await runQuery(sql, [hearts, id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM items WHERE id = ?';
        
        try {
            const result = await runQuery(sql, [id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    static async search(searchTerm) {
        const sql = `
            SELECT i.*, u.username as sellerUsername 
            FROM items i 
            LEFT JOIN users u ON i.sellerId = u.id 
            WHERE i.title LIKE ? OR i.itemDetail LIKE ? 
            ORDER BY i.listDate DESC
        `;
        
        try {
            const items = await allQuery(sql, [`%${searchTerm}%`, `%${searchTerm}%`]);
            return items;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Item;
