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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
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
            <div className="banner" style={{ 
                background: `url(${Banner})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                }}>
                <div className="textcontainer">
                    <h1 className="luminance-text">BidQuantum</h1>
                    <h2 className="luminance-text">Intelligent Predictive Bidding</h2>
                    <p>By Anuj Ghosh</p>
                    <div className="bid">
                        <Link to={`/bid/${items[0]?.id}`} className="button1">Bid Now</Link>
                        <p>Ending In: <span>2d:15h:20m</span></p>
                    </div>
                </div>
            </div>

            <div className="cards">
                <div className="filters">
                    <div className="popular">
                        <h2>New items</h2>   
                    </div>
                    <div className="filter_buttons">
                        <Link to="/gallery" className="button1">All</Link>
                        <select>
                          <option value="">Select a Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                    </div>
                </div>

                <main>
                    {items.map((item) => (
                        <CardMain
                            key={item.id}
                            id={item.id}
                            imgSrc={item.image}
                            title={item.title}
                            sellerName={item.sellerName}
                            hearts={item.hearts}
                            currentBid={item.currentBid}
                            previousBid={item.previousBid}
                            predictedStartingPrice={item.predictedStartingPrice}
                            listDate={item.listDate}
                            onDelete={() => handleDelete(item.id)}
                            user={user}
                        />
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
