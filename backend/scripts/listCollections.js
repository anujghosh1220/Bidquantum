const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
    try {
        // Connect to MongoDB using the same connection string as your server
        await mongoose.connect('mongodb://127.0.0.1:27017/auction_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        console.log('\nCollections in auction_db:');
        console.log('------------------------');
        
        // For each collection, get the count of documents
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`${collection.name}: ${count} documents`);
        }
        
        console.log('------------------------');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Connection closed');
    }
}

listCollections();
