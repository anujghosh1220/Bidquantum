## Entity-Relationship Diagram for Auction Platform

```mermaid
erDiagram
    USER ||--o{ ITEM : "lists"
    USER ||--o{ BID : "places"
    ITEM ||--o{ BID : "receives"

    USER {
        string userId PK
        string username
        string email
        string password
        date createdAt
    }

    ITEM {
        string itemId PK
        string title
        number startingPrice
        number currentBid
        string image
        date listDate
        string userId FK
    }

    BID {
        string bidId PK
        string itemId FK
        string userId FK
        string username
        number bidAmount
        date bidTime
    }
```

### Relationships Explained:
- A User can list multiple Items
- A User can place multiple Bids
- An Item can receive multiple Bids
- Each Bid is associated with a specific Item and User

### Cardinality:
- One User can have zero or many Items (||--o{)
- One User can have zero or many Bids (||--o{)
- One Item can have zero or many Bids (||--o{)
