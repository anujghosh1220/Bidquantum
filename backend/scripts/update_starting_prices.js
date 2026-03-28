const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Item Schema
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    hearts: { type: Number, default: 0 },
    currentBid: { type: Number, required: true },
    previousBid: { type: Number },
    startingPrice: { 
        type: Number, 
        default: function() {
            // Predict starting price if not provided
            if (this.previousBid && this.currentBid) {
                // Calculate starting price as 80% of the lower bid
                return Math.max(
                    Math.min(this.previousBid, this.currentBid) * 0.8, 
                    1 // Ensure minimum starting price is 1
                );
            }
            return this.currentBid * 0.8; // Default to 80% of current bid
        }
    },
    image: { type: String, required: true },
    listDate: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

async function updateStartingPrices() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/auction_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Find all items
        const items = await Item.find({});

        // Update each item's starting price
        for (const item of items) {
            // Predict starting price
            if (item.previousBid && item.currentBid) {
                item.startingPrice = Math.max(
                    Math.min(item.previousBid, item.currentBid) * 0.8, 
                    1
                );
            } else {
                item.startingPrice = item.currentBid * 0.8;
            }

            // Save the updated item
            await item.save();
        }

        console.log(`Updated starting prices for ${items.length} items`);
    } catch (error) {
        console.error('Error updating starting prices:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
    }
}

// Run the update
updateStartingPrices();
