const { runQuery } = require('../config/database');

async function createVerificationTable() {
  try {
    console.log('Creating user verification table...');

    // Create user_verification table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS user_verification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        zip_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        id_type VARCHAR(50) NOT NULL,
        id_number VARCHAR(100) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        documents TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        rejection_reason TEXT,
        admin_note TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('User verification table created successfully!');

    // Add verification fields to users table
    await runQuery(`
      ALTER TABLE users 
      ADD COLUMN verification_status VARCHAR(50) DEFAULT 'none'
    `);

    await runQuery(`
      ALTER TABLE users 
      ADD COLUMN verified_at DATETIME
    `);

    console.log('Users table updated with verification fields!');

    // Create verification_documents table for better document management
    await runQuery(`
      CREATE TABLE IF NOT EXISTS verification_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verification_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (verification_id) REFERENCES user_verification(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Verification documents table created successfully!');

    // Create verification_logs table for audit trail
    await runQuery(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verification_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        performed_by INTEGER,
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (verification_id) REFERENCES user_verification(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id)
      )
    `);

    console.log('Verification logs table created successfully!');

    // Create indexes for better performance
    await runQuery('CREATE INDEX IF NOT EXISTS idx_verification_user_id ON user_verification(user_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_verification_status ON user_verification(status)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_verification_submitted_at ON user_verification(submitted_at)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id)');

    console.log('Verification indexes created successfully!');

    console.log('All verification-related tables created successfully!');

  } catch (error) {
    console.error('Error creating verification tables:', error);
    throw error;
  }
}

if (require.main === module) {
  createVerificationTable()
    .then(() => {
      console.log('Verification tables setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createVerificationTable };
