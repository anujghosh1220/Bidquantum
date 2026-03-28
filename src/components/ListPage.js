import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopContainer from './TopContainer';
import Menu from './Menu';
import axios from 'axios';
import './ListPage.css';

function ListPage() {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    // Fetch items and their bids
    const fetchItemsAndBids = async () => {
      try {
        // Fetch items
        const itemsResponse = await axios.get('http://localhost:5000/api/items');
        const fetchedItems = itemsResponse.data;
        setItems(fetchedItems);

        // Fetch bids for each item
        const bidPromises = fetchedItems.map(item => 
          axios.get(`http://localhost:5000/api/items/${item._id}/bids`)
        );

        const bidResponses = await Promise.all(bidPromises);
        const bidMap = {};
        
        bidResponses.forEach((response, index) => {
          const itemId = fetchedItems[index]._id;
          const itemBids = response.data.bids || [];
          
          // Log bids for debugging
          console.log(`Bids for item ${itemId}:`, itemBids);
          
          bidMap[itemId] = itemBids;
        });

        setBids(bidMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items or bids');
        setLoading(false);
        console.error('Error fetching items or bids:', err);
      }
    };

    fetchUserProfile();
    fetchItemsAndBids();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/signin');
  };

  const handlePayNow = (itemId, bidAmount) => {
    navigate('/payments', { 
      state: { 
        itemId,
        amount: bidAmount,
        // Add any other data you want to pass to the payments page
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="list-page">
      <TopContainer user={user} onSignOut={handleSignOut} />
      <Menu />
      
      {/* User Profile Section */}
      {user && (
        <div className="user-profile-section">
          <div className="user-profile-container" onClick={handleProfileClick}>
            <img 
              src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : 'https://via.placeholder.com/50'}
              alt="Profile" 
              className="user-profile-photo"
            />
            <div className="user-profile-info">
              <h3>{user.username}</h3>
              <p>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="items-bid-tables-container">
        {items.map((item) => {
          // Find the highest bid
          const itemBids = bids[item._id] || [];
          const highestBid = itemBids.length > 0 
            ? itemBids.reduce((max, bid) => bid.bidAmount > max.bidAmount ? bid : max, itemBids[0])
            : null;

          return (
            <div key={item._id} className="item-bid-table-wrapper">
              <h3>{item.title}</h3>
              
              {/* Winner Section */}
              {highestBid && (
                <div className="winner-section">
                  <h4>Winner</h4>
                  <table className="winner-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Bid Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{highestBid.username}</td>
                        <td>${Math.ceil(highestBid.bidAmount)}</td>
                        <td>
                          <button 
                            onClick={() => handlePayNow(item._id, highestBid.bidAmount)}
                            className="pay-button" 
                            style={{ 
                              padding: '5px 15px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              width: '100%',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                          >
                            Pay here
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* All Bids Section */}
              <table className="item-bid-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Bid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemBids.length > 0 ? (
                    itemBids.map((bid, index) => (
                      <tr key={index} className={bid === highestBid ? 'highest-bid' : ''}>
                        <td>{bid.username}</td>
                        <td>${Math.ceil(bid.bidAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No bids yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListPage;
