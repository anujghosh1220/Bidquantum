const { runQuery, allQuery } = require('../config/database_sqlite');
const bcrypt = require('bcryptjs');

const dummyItems = [
    {
        title: "Vintage Rolex Watch",
        sellerName: "John Smith",
        itemDetail: "Classic 1965 Rolex Submariner in excellent condition. Original box and papers included.",
        currentBid: 15000.00,
        previousBid: 12000.00,
        productDetails: "Automatic movement, stainless steel case, waterproof to 100m. Recently serviced by authorized dealer.",
        predictedStartingPrice: 10000.00,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    },
    {
        title: "First Edition Harry Potter Book",
        sellerName: "Emma Wilson",
        itemDetail: "Harry Potter and the Philosopher's Stone, first edition, first printing. Hard cover with dust jacket.",
        currentBid: 8500.00,
        previousBid: 7500.00,
        productDetails: "Published 1997, Bloomsbury. Very good condition with minor wear on dust jacket. A true collector's item.",
        predictedStartingPrice: 5000.00,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"
    },
    {
        title: "1967 Gibson Les Paul Guitar",
        sellerName: "Mike Johnson",
        itemDetail: "Vintage 1967 Gibson Les Paul Standard in sunburst finish. All original parts and electronics.",
        currentBid: 25000.00,
        previousBid: 22000.00,
        productDetails: "Mahogany body with maple cap, PAF pickups, original case. Excellent playing condition with beautiful aging.",
        predictedStartingPrice: 20000.00,
        image: "https://images.unsplash.com/photo-1611609302020-6110a05c6c0c?w=400&h=300&fit=crop"
    },
    {
        title: "Ancient Roman Coin Collection",
        sellerName: "Dr. Sarah Martinez",
        itemDetail: "Collection of 12 authentic Roman coins from 1st-3rd century AD. Includes coins of various emperors.",
        currentBid: 3200.00,
        previousBid: 2800.00,
        productDetails: "Silver and bronze coins, various conditions. Each coin authenticated and comes with certificate.",
        predictedStartingPrice: 2000.00,
        image: "https://images.unsplash.com/photo-1587045525472-71d475ed61c6?w=400&h=300&fit=crop"
    },
    {
        title: "Original Picasso Lithograph",
        sellerName: "Art Gallery Plus",
        itemDetail: "Original lithograph by Pablo Picasso, signed and numbered. From the 'Bullfight' series, 1959.",
        currentBid: 18000.00,
        previousBid: 15000.00,
        productDetails: "Limited edition 23/50. Excellent condition, professionally framed. Certificate of authenticity included.",
        predictedStartingPrice: 12000.00,
        image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop"
    },
    {
        title: "1955 Mercedes-Benz 300SL",
        sellerName: "Classic Cars Inc",
        itemDetail: "Iconic 1955 Mercedes-Benz 300SL Gullwing. Fully restored to original specifications.",
        currentBid: 1500000.00,
        previousBid: 1200000.00,
        productDetails: "Silver with red interior, 3.0L inline-6 engine, 4-speed manual. Complete restoration documentation available.",
        predictedStartingPrice: 1000000.00,
        image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop"
    },
    {
        title: "Ming Dynasty Vase",
        sellerName: "Asian Antiques",
        itemDetail: "Authentic Ming Dynasty blue and white porcelain vase, 15th century. Excellent condition.",
        currentBid: 45000.00,
        previousBid: 40000.00,
        productDetails: "Height: 45cm. Traditional dragon motif. Expert authentication and provenance documentation included.",
        predictedStartingPrice: 30000.00,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
        title: "Neil Armstrong Signed Photo",
        sellerName: "Space Memorabilia",
        itemDetail: "Autographed photo of Neil Armstrong on the moon. Signed in person with certificate of authenticity.",
        currentBid: 12000.00,
        previousBid: 10000.00,
        productDetails: "16x20 inch photo, professionally framed. PSA/DNA authenticated. One of the rarest space signatures.",
        predictedStartingPrice: 8000.00,
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop"
    },
    {
        title: "Stradivarius Violin Copy",
        sellerName: "Classical Instruments",
        itemDetail: "High-quality 19th century Stradivarius copy. Excellent tone and playability.",
        currentBid: 8500.00,
        previousBid: 7000.00,
        productDetails: "Maple back and sides, spruce top. Expert setup with new strings. Comes with professional case.",
        predictedStartingPrice: 5000.00,
        image: "https://images.unsplash.com/photo-1593030415341-1c322e6d4d57?w=400&h=300&fit=crop"
    },
    {
        title: "Civil War Era Sword",
        sellerName: "Military Antiques",
        itemDetail: "Original American Civil War cavalry saber, 1863. Complete with scabbard.",
        currentBid: 6800.00,
        previousBid: 5500.00,
        productDetails: "Union Army Model 1860 light cavalry saber. Maker marked and dated. Good condition with expected wear.",
        predictedStartingPrice: 4000.00,
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop"
    },
    {
        title: "Diamond Necklace",
        sellerName: "Luxury Jewels",
        itemDetail: "18k white gold necklace with 2.5 carat total diamond weight. GIA certified diamonds.",
        currentBid: 35000.00,
        previousBid: 30000.00,
        productDetails: "Round brilliant cut diamonds, VS1-VS2 clarity, G-H color. 16 inch length with security clasp.",
        predictedStartingPrice: 25000.00,
        image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfbe2b?w=400&h=300&fit=crop"
    },
    {
        title: "Vintage Comic Book Collection",
        sellerName: "Comic Kingdom",
        itemDetail: "Collection of 10 key Silver Age comics including Amazing Fantasy #15 (Spider-Man first appearance).",
        currentBid: 28000.00,
        previousBid: 25000.00,
        productDetails: "Graded comics ranging from VG to Fine. All professionally graded and slabbed. Investment grade collection.",
        predictedStartingPrice: 20000.00,
        image: "https://images.unsplash.com/photo-1612033564847-9c6f25b38c67?w=400&h=300&fit=crop"
    },
    {
        title: "Antique Pocket Watch",
        sellerName: "Time Pieces",
        itemDetail: "19th century Swiss pocket watch in 18k gold case. Complicated movement with moon phase.",
        currentBid: 9200.00,
        previousBid: 8000.00,
        productDetails: "Key-wind movement, enamel dial, gold hands. Working condition with recent service. Original box included.",
        predictedStartingPrice: 6000.00,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a13?w=400&h=300&fit=crop"
    },
    {
        title: "Original Movie Poster",
        sellerName: "Cinema Classics",
        itemDetail: "Original 1942 Casablanca movie poster. Very good condition with minimal restoration.",
        currentBid: 15000.00,
        previousBid: 12000.00,
        productDetails: "27x41 inch one-sheet poster. linen-backed for preservation. Certificate of authenticity included.",
        predictedStartingPrice: 10000.00,
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop"
    },
    {
        title: "Rare Stamp Collection",
        sellerName: "Philatelist Corner",
        itemDetail: "Collection of rare British Empire stamps including Penny Black and Two Pence Blue.",
        currentBid: 7800.00,
        previousBid: 6500.00,
        productDetails: "Various conditions from fine to very fine. All stamps expertly authenticated and mounted.",
        predictedStartingPrice: 5000.00,
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop"
    },
    {
        title: "Tiffany Lamp",
        sellerName: "Art Nouveau Gallery",
        itemDetail: "Authentic Tiffany Studios leaded glass lamp, dragonfly design. Circa 1905.",
        currentBid: 55000.00,
        previousBid: 45000.00,
        productDetails: "Original base and shade. Excellent condition with proper electrical update. Signed Tiffany Studios New York.",
        predictedStartingPrice: 35000.00,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
        title: "Vintage Leica Camera",
        sellerName: "Photo Equipment",
        itemDetail: "Leica M3 rangefinder camera with Summilux 50mm f/1.4 lens. Fully functional.",
        currentBid: 4200.00,
        previousBid: 3500.00,
        productDetails: "1960s model, excellent working condition. Recently serviced. Comes with original leather case.",
        predictedStartingPrice: 2500.00,
        image: "https://images.unsplash.com/photo-1526170375888-9d8f957c3c0d?w=400&h=300&fit=crop"
    },
    {
        title: "Ancient Greek Pottery",
        sellerName: "Museum Replicas",
        itemDetail: "Authentic Attic red-figure amphora, 5th century BC. Museum quality piece.",
        currentBid: 18000.00,
        previousBid: 15000.00,
        productDetails: "Height: 61cm. Depicts mythological scene. Professional restoration and authentication included.",
        predictedStartingPrice: 12000.00,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
        title: "Signed Baseball Memorabilia",
        sellerName: "Sports Collectibles",
        itemDetail: "Baseball signed by 1955 Yankees team including Mickey Mantle and Joe DiMaggio.",
        currentBid: 6500.00,
        previousBid: 5000.00,
        productDetails: "Official American League baseball, PSA/DNA authenticated. Display case included. Rare signatures.",
        predictedStartingPrice: 3500.00,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
];

const dummyUsers = [
    {
        username: "John Smith",
        email: "john@example.com",
        password: "password123",
        city: "New York",
        phone: "555-0101"
    },
    {
        username: "Emma Wilson",
        email: "emma@example.com",
        password: "password123",
        city: "Los Angeles",
        phone: "555-0102"
    },
    {
        username: "Mike Johnson",
        email: "mike@example.com",
        password: "password123",
        city: "Chicago",
        phone: "555-0103"
    },
    {
        username: "Sarah Martinez",
        email: "sarah@example.com",
        password: "password123",
        city: "Houston",
        phone: "555-0104"
    },
    {
        username: "Art Gallery Plus",
        email: "gallery@example.com",
        password: "password123",
        city: "Miami",
        phone: "555-0105"
    }
];

async function populateDatabase() {
    try {
        console.log('Populating SQLite database...');
        
        console.log('Creating dummy users...');
        const userIds = [];
        
        for (const user of dummyUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const sql = `
                INSERT OR IGNORE INTO users (username, email, password, city, phone)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            try {
                const result = await runQuery(sql, [
                    user.username,
                    user.email,
                    hashedPassword,
                    user.city,
                    user.phone
                ]);
                
                if (result.id) {
                    userIds.push(result.id);
                    console.log(`Created user: ${user.username}`);
                } else {
                    // User already exists, get their ID
                    const existingUser = await allQuery('SELECT id FROM users WHERE email = ?', [user.email]);
                    if (existingUser.length > 0) {
                        userIds.push(existingUser[0].id);
                        console.log(`User ${user.email} already exists, using existing ID`);
                    }
                }
            } catch (error) {
                console.error(`Error creating user ${user.username}:`, error);
            }
        }
        
        console.log('Creating dummy items...');
        for (const item of dummyItems) {
            const randomSellerId = userIds[Math.floor(Math.random() * userIds.length)];
            const sql = `
                INSERT INTO items (title, sellerName, itemDetail, currentBid, previousBid, productDetails, predictedStartingPrice, image, sellerId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            try {
                await runQuery(sql, [
                    item.title,
                    item.sellerName,
                    item.itemDetail,
                    item.currentBid,
                    item.previousBid,
                    item.productDetails,
                    item.predictedStartingPrice,
                    item.image,
                    randomSellerId
                ]);
                console.log(`Created item: ${item.title}`);
            } catch (error) {
                console.error(`Error creating item ${item.title}:`, error);
            }
        }
        
        console.log('Database populated successfully!');
        console.log(`Created ${dummyUsers.length} users and ${dummyItems.length} items`);
        
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        process.exit(0);
    }
}

populateDatabase();
