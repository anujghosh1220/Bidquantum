import React, { useState, useEffect } from 'react';
import './MContainer.css';
import { Link } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios';

import Banner from '../images/background2.jpg';
import Card1 from '../images/Card1.jpg';
import Card2 from '../images/Card2.jpg';
import Card3 from '../images/Card3.jpg';
import Card4 from '../images/Card4.jpg';
import Card5 from '../images/Card5.jpg';
import Card6 from '../images/Card6.jpg';
import CardMain from './CardMain';
import MainRightTop from './MainRightTop';
import MainRightBottom from './MainRightBottom';

function MContainer({ user }) {
  const [items, setItems] = useState([]);
  const [userPredictions, setUserPredictions] = useState({});

  useEffect(() => {
    fetchItems();
    if (user) {
      fetchUserPredictions();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchUserPredictions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analytics/predictions/${user.id}`);
      setUserPredictions(response.data);
    } catch (error) {
      console.error('Error fetching user predictions:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`);
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const categories = [
    'Jewelry',
    'Antique',
    'Furniture', 
    'Electronics',
    'Art',
    'Collectibles',
    'Vintage Clothing',
    'Rare Books',
    'Automotive',
    'Sports Memorabilia'
  ];

  return (
    <div className='mainContainer'>
        <div className="left">
            <div className="banner">
                <div className="banner-overlay"></div>
                <div className="textcontainer">
                    <div className="banner-content">
                        <h1 className="banner-title text-gradient">BidQuantum</h1>
                        <h2 className="banner-subtitle">Intelligent Predictive Bidding</h2>
                        <p className="banner-author">By Anuj Ghosh</p>
                        <div className="banner-stats">
                            <div className="stat-item">
                                <span className="stat-number">{items.length}</span>
                                <span className="stat-label">Active Items</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">24/7</span>
                                <span className="stat-label">Live Trading</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">AI</span>
                                <span className="stat-label">Powered</span>
                            </div>
                        </div>
                        <div className="bid">
                            <Link to={`/bid/${items[0]?.id}`} className="bid-button">
                                <span>Start Bidding</span>
                                <div className="button-glow"></div>
                            </Link>
                            <div className="countdown-container">
                                <p>Next Auction Ends:</p>
                                <div className="countdown">
                                    <span className="time-unit">2d</span>
                                    <span className="time-separator">:</span>
                                    <span className="time-unit">15h</span>
                                    <span className="time-separator">:</span>
                                    <span className="time-unit">20m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cards">
                <div className="filters">
                    <div className="popular">
                        <h2 className="section-title">
                            <span className="title-icon">🔥</span>
                            Featured Items
                        </h2>   
                        <p className="section-subtitle">Discover premium auction items</p>
                    </div>
                    <div className="filter_buttons">
                        <Link to="/gallery" className="btn btn-primary">View All</Link>
                        <select className="input category-select">
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                    </div>
                </div>

                <main className="items-grid">
                    {items.map((item, index) => (
                        <div key={item.id} className="item-card-wrapper" style={{animationDelay: `${index * 0.1}s`}}>
                            <CardMain
                                id={item.id}
                                imgSrc={item.image}
                                title={item.title}
                                sellerName={item.sellerName}
                                hearts={item.hearts}
                                currentBid={item.currentBid}
                                previousBid={item.previousBid}
                                predictedStartingPrice={userPredictions[item.id] || item.predictedStartingPrice}
                                listDate={item.listDate}
                                onDelete={() => handleDelete(item.id)}
                                user={user}
                            />
                        </div>
                    ))}
                </main>
            </div>
        </div>
        <div className="right">
            <MainRightTop />
            <MainRightBottom />
        </div>
    </div>
  );
}

export default MContainer;
