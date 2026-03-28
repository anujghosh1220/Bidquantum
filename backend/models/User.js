const { runQuery, getQuery, allQuery } = require('../config/database');

class User {
    static async create(userData) {
        const { username, email, password, city, phone, profilePicture, isAdmin = false } = userData;
        const sql = `
            INSERT INTO users (username, email, password, city, phone, profilePicture, isAdmin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const result = await runQuery(sql, [username, email, password, city, phone, profilePicture, isAdmin]);
            return result.id;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        
        try {
            const user = await getQuery(sql, [email]);
            return user || null;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        
        try {
            const user = await getQuery(sql, [id]);
            return user || null;
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const sql = 'SELECT id, username, email, city, phone, profilePicture, isAdmin, createdAt FROM users';
        
        try {
            const users = await allQuery(sql);
            return users;
        } catch (error) {
            throw error;
        }
    }

    static async updateProfile(id, updateData) {
        const { username, city, phone, profilePicture } = updateData;
        const sql = `
            UPDATE users 
            SET username = ?, city = ?, phone = ?, profilePicture = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        try {
            const result = await runQuery(sql, [username, city, phone, profilePicture, id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        
        try {
            const result = await runQuery(sql, [id]);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
