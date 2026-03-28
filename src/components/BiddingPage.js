import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Menu from './Menu';
import TopContainer from './TopContainer';
import BidRecommendation from './BidRecommendation';
import { BsFillHeartFill } from "react-icons/bs";
import axios from 'axios';
import './BiddingPage.css';

function BiddingCard({ item, onBid, user }) {
  const [showBidBox, setShowBidBox] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  // Listen for recommendation application events
  useEffect(() => {
    const handleApplyRecommendation = (event) => {
      setBidAmount(event.detail.amount.toString());
      setShowBidBox(true);
    };

    window.addEventListener('applyRecommendation', handleApplyRecommendation);
    return () => window.removeEventListener('applyRecommendation', handleApplyRecommendation);
  }, []);

  // Validate user is logged in before allowing bid
  useEffect(() => {
    console.log('User in BiddingCard:', user); // Debug log
    if (!user) {
      setShowBidBox(false);
    }
  }, [user]);

  // Safely calculate predicted starting price
  const predictedStartingPrice = item.predictedStartingPrice !== undefined 
    ? Math.ceil(item.predictedStartingPrice) 
    : Math.ceil(item.currentBid * 0.7);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError(''); // Reset any previous errors

    // Enhanced debug logging
    console.log('=== BID SUBMISSION START ===');
    console.log('User object in handleBidSubmit:', JSON.stringify(user, null, 2));
    console.log('User ID (_id):', user?._id);
    console.log('User ID (id):', user?.id);
    console.log('Username:', user?.username);
    console.log('User object keys:', user ? Object.keys(user) : 'No user object');
    console.log('User object type:', typeof user);

    // Ensure user is logged in
    if (!user) {
      console.error('No user object available');
      setBidError('Please log in to place a bid');
      return;
    }

    // Convert bid amount to number and round up
    const bidAmountNum = Math.ceil(parseFloat(bidAmount));

    // Validate bid amount
    if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      setBidError('Please enter a valid bid amount');
      return;
    }

    // Check if bid is greater than starting price
    if (bidAmountNum <= predictedStartingPrice) {
      setBidError(`Bid must be greater than the starting price of $${predictedStartingPrice}`);
      return;
    }

    // The current bid check was removed to fix the issue

    try {
      // Log the user object to debug
      console.log('User object in bid submission:', user);
      
      // Ensure we have a valid user ID
      const userId = user?._id || user?.id;
      
      if (!userId) {
        console.error('User ID is missing in the user object. User object:', user);
        console.error('Available keys in user object:', user ? Object.keys(user) : 'No user object');
        setBidError('User authentication error. Please log in again.');
        return;
      }
      
      console.log('Using user ID for bid:', userId);

      console.log('Sending bid with data:', {
        bidAmount: bidAmountNum,
        userId: userId,
        username: user?.username || 'Unknown',
        itemName: item.title,
        itemTitle: item.title
      });

      const response = await axios.post(`http://localhost:5000/api/items/${item.id}/bids`, {
        bidAmount: bidAmountNum,
        userId: userId,
        username: user?.username || 'Unknown',
        itemName: item.title,
        itemTitle: item.title
      });
      
      console.log('Bid response:', response.data);

      // Reset bid box and amount after successful bid
      setShowBidBox(false);
      setBidAmount('');
      
      // Call parent component's onBid method if provided
      if (onBid) {
        onBid(response.data);
      }

      // Optional: Show success message
      alert('Bid placed successfully!');
    } catch (error) {
      console.error('Bid submission error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Provide more detailed error message
        if (error.response.status === 401) {
          setBidError('Authentication failed. Please log in again.');
        } else if (error.response.data && error.response.data.message) {
          setBidError(`Error: ${error.response.data.message}`);
        } else {
          setBidError(`Error: ${error.response.status} - ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setBidError('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        setBidError(`Error: ${error.message}`);
      }
    }
  };

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="bidding_card">
        <div className="bidding_card_content">
          <p>Please log in to place a bid</p>
        </div>
      </div>
    );
  }

  // Fallback image in case image is undefined or invalid
  const fallbackImage = 'https://via.placeholder.com/250x250.png?text=No+Image';

  return (
    <div className='bidding_card'>
      <div className="bidding_card_content">
        <img 
          src={item.image || fallbackImage} 
          alt={item.title || 'Item Image'} 
          className="bidding_card_image"
          onError={(e) => {
            console.error('Image load error:', e);
            e.target.src = fallbackImage;
          }}
        />
        <div className="bidding_card_details">
          <h3>{item.title}</h3>
          <div className="bidding_card_info">
            <p>Current Bid: <span>${Math.ceil(item.currentBid)}</span></p>
            <p>Predicted Starting Price: <span>${predictedStartingPrice}</span></p>
            <div className="card_icon">
              <BsFillHeartFill /> <span>{item.hearts || 0}</span>
            </div>
          </div>
          
          {/* Bid Recommendation - Only show for logged-in users */}
          {user && (
            <BidRecommendation 
              user={user}
              itemId={item.id}
              currentBid={item.currentBid}
              predictedStartingPrice={predictedStartingPrice}
            />
          )}
          
          <button 
            className="bid_now_button" 
            onClick={() => setShowBidBox(!showBidBox)}
          >
            {showBidBox ? 'Cancel' : 'Bid'}
          </button>
          
          {showBidBox && (
            <form onSubmit={handleBidSubmit} className="bid_input_box">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Enter bid above $${predictedStartingPrice}`}
                min={predictedStartingPrice + 1}
                step="1"
                required
              />
              {bidError && <p className="bid_error" style={{color: 'red', fontSize: '0.8em'}}>{bidError}</p>}
              <button type="submit" className="submit_bid_button">Submit Bid</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function BiddingPage({ user, onSignOut = () => {} }) {
  const [items, setItems] = useState([]);
  const [bidHistory, setBidHistory] = useState({});

  // Log user object when component mounts or user changes
  useEffect(() => {
    console.log('BiddingPage - User object:', user);
    if (user) {
      console.log('User ID (_id):', user._id);
      console.log('User ID (id):', user.id);
      console.log('User object keys:', Object.keys(user));
    } else {
      console.log('No user object available');
    }
  }, [user]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    const fetchBidHistory = async () => {
      try {
        const histories = {};
        for (const item of items) {
          const response = await axios.get(`http://localhost:5000/api/items/${item.id}/bids`);
          histories[item.id] = response.data || []; // Ensure it's always an array
        }
        setBidHistory(histories);
      } catch (error) {
        console.error('Error fetching bid histories:', error);
      }
    };

    fetchItems();
    if (items.length > 0) {
      fetchBidHistory();
    }
  }, [items.length]);

  const handleBidUpdate = (itemId, newBidAmount, username) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              currentBid: newBidAmount,
              lastBidder: username
            } 
          : item
      )
    );
    
    // Refresh bid history for the specific item
    const fetchItemBidHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${itemId}/bids`);
        setBidHistory(prevHistory => ({
          ...prevHistory,
          [itemId]: response.data || [] // Ensure it's always an array
        }));
      } catch (error) {
        console.error('Error refreshing bid history:', error);
      }
    };
    fetchItemBidHistory();
  };

  return (
    <div className="bidding_page_wrapper">
      <div className="menu_wrapper">
        <Menu />
      </div>
      <div className="main_content">
        <TopContainer user={user} onSignOut={onSignOut} />
        <div className="bidding_container">
          <h1>Bidding</h1>
          <div className="bidding_items_list">
            {items.map(item => (
              <div key={item.id} className="bidding_item_with_history">
                <BiddingCard 
                  item={item} 
                  onBid={handleBidUpdate}
                  user={user}
                />
                <div className="bid_history_table">
                  <h3>Bid History</h3>
                  {bidHistory[item.id] && bidHistory[item.id].length > 0 ? (
                    bidHistory[item.id].map((bid, index) => (
                      <tr key={index}>
                        <td>{bid.username}</td>
                        <td>{item.title}</td>
                        <td>${bid.bidAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <p>No bid history available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiddingPage;
