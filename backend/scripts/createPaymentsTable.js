const { runQuery } = require('../config/database');

async function createPaymentsTable() {
  try {
    console.log('Creating payments table...');

    // Create payments table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        item_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        payment_type VARCHAR(50) NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        refund_id VARCHAR(255),
        refunded_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    console.log('Payments table created successfully!');

    // Create escrow_holds table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS escrow_holds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
        item_id INTEGER NOT NULL,
        winner_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'hold',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        released_at DATETIME,
        FOREIGN KEY (winner_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    console.log('Escrow holds table created successfully!');

    // Add stripe_account_id to users table
    await runQuery(`
      ALTER TABLE users 
      ADD COLUMN stripe_account_id VARCHAR(255)
    `);

    await runQuery(`
      ALTER TABLE users 
      ADD COLUMN seller_status VARCHAR(50) DEFAULT 'none'
    `);

    console.log('Users table updated with Stripe fields!');

    // Create payment_methods table for saved payment methods
    await runQuery(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        stripe_payment_method_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        last4 VARCHAR(4),
        brand VARCHAR(50),
        expiry_month INTEGER,
        expiry_year INTEGER,
        is_default BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Payment methods table created successfully!');

    // Create transactions table for comprehensive tracking
    await runQuery(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_intent_id VARCHAR(255),
        user_id INTEGER NOT NULL,
        item_id INTEGER,
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        fee DECIMAL(10,2) DEFAULT 0,
        net_amount DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    console.log('Transactions table created successfully!');

    console.log('All payment-related tables created successfully!');

  } catch (error) {
    console.error('Error creating payment tables:', error);
    throw error;
  }
}

if (require.main === module) {
  createPaymentsTable()
    .then(() => {
      console.log('Payment tables setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createPaymentsTable };
