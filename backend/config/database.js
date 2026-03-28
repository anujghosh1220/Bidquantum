const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../database/auction.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
const initializeDatabase = () => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            city TEXT,
            phone TEXT,
            profilePicture TEXT,
            isAdmin BOOLEAN DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Create items table
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            sellerName TEXT NOT NULL,
            itemDetail TEXT NOT NULL,
            hearts INTEGER DEFAULT 0,
            currentBid REAL NOT NULL,
            previousBid REAL,
            productDetails TEXT DEFAULT '',
            predictedStartingPrice REAL,
            image TEXT,
            sellerId INTEGER,
            listDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE SET NULL
        )
    `);
    
    // Create bids table
    db.run(`
        CREATE TABLE IF NOT EXISTS bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER NOT NULL,
            userId INTEGER,
            username TEXT NOT NULL,
            bidAmount REAL NOT NULL,
            bidTime DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
    `);
    
    console.log('Database tables initialized successfully');
};

// Helper functions for database operations
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const getQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const allQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Test connection
const testConnection = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT 1', (err, row) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database connection test successful');
                resolve(row);
            }
        });
    });
};

// Close database connection
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
};

module.exports = {
    db,
    runQuery,
    getQuery,
    allQuery,
    testConnection,
    closeDatabase
};
