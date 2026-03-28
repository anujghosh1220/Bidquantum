import React, { useState, useEffect } from 'react';
import './MGallery.css';
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

function MGallery({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`);
        setItems(items.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

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
                    <h1 className="luminance-text">Real-time Auction</h1>
                    <h2 className="luminance-text">Using Predictive Bidding</h2>
                    <p>By Anuj Ghosh</p>
                    <div className="bid">
                        <Link to={`/bid/${items[0]?._id}`} className="button1">Bid Now</Link>
                        <p>Ending In: <span>2d:15h:20m</span></p>
                    </div>
                </div>
            </div>

            <div className="cards">
                <div className="filters">
                    <div className="popular">
                        <h2>Feed</h2>   
                    </div>
                    <div className="filter_buttons">
                        <Link to="/gallery" className="button1">All</Link> {/* Updated here */}
                        <a href="example" className="button2">Illustration</a>
                        <a href="example" className="button2">Art</a>
                        <a href="example" className="button2">Games</a>
                    </div>
                </div>

                <main>
                    {items.map((item) => (
                        <CardMain
                            key={item._id}
                            id={item._id}
                            imgSrc={`http://localhost:5000/${item.image}`}
                            title={item.title}
                            hearts={item.hearts}
                            currentBid={item.currentBid}
                            previousBid={item.previousBid}
                            startingPrice={item.startingPrice}
                            listDate={item.listDate}
                            onDelete={() => handleDelete(item._id)}
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

export default MGallery;
