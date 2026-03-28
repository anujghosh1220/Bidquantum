import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import TopContainer from '../components/TopContainer';
import './Gallery.css';
import { BsFillHeartFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import axios from 'axios';

// GalleryCardMain component
function GalleryCardMain({id, imgSrc, title, hearts, currentBid, previousBid, startingPrice, listDate, productDetails, sellerName, itemDetail, onDelete, user, predictedStartingPrice}) {
  const [showHistory, setShowHistory] = React.useState(false);

  const toggleHistory = (e) => {
    e.preventDefault();
    setShowHistory(!showHistory);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onDelete(id);
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <div className='card_main'>
      <img src={imgSrc} alt={title} />

      <div className="card_main_name">
        <h2>{title}</h2>
        <div className="card_icon">
          <i><BsFillHeartFill /> <span>{hearts}</span>{" "}</i>
        </div>
      </div>

      <div className="stats">
        <p>Current Bid <span>${currentBid}</span></p>
        <p>Starting Price <span>${Math.floor(predictedStartingPrice || 0)}</span></p>
      </div>

      <div className="card_button">
        <Link to={`/bid/${id}`} className="button1 btn">Place Bid</Link>
        {user?.isAdmin ? (
          <a href=" " className="button2 btn delete-btn" onClick={handleDelete}>Delete</a>
        ) : (
          <a href=" " className="button2 btn" onClick={toggleHistory}>History</a>
        )}
      </div>

      {!user?.isAdmin && (
        <div className={`history_dropdown ${showHistory ? 'active' : ''}`}>
          <div className="bid_history">
            <div className="product-details">
              {sellerName && <p><strong>Seller:</strong> {sellerName}</p>}
              {itemDetail && <p><strong>Details:</strong> {itemDetail}</p>}
              {productDetails && <p><strong>Additional Info:</strong> {productDetails}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Gallery component
function Gallery({ user }) {
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
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      // Update the items state by filtering out the deleted item
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="Gallery">
      <Menu />
      <div className="galleryContainer">
        <TopContainer user={user} />
        <div className="galleryContent">
          <h1>Gallery</h1>
          {user?.isAdmin && (
            <div className="admin-buttons">
              <Link to="/admin" className="add-item-btn">Add New Item</Link>
              {!user.isAdmin && (
                <Link to="/charity" className="add-item-btn charity-btn">Charity</Link>
              )}
            </div>
          )}
          <div className="gallery-grid">
            {items.map(item => (
              <GalleryCardMain
                key={item.id}
                id={item.id}
                imgSrc={item.image}
                title={item.title}
                hearts={item.hearts}
                currentBid={item.currentBid}
                previousBid={item.previousBid}
                predictedStartingPrice={item.predictedStartingPrice}
                listDate={item.listDate}
                productDetails={item.productDetails}
                sellerName={item.sellerName}
                itemDetail={item.itemDetail}
                onDelete={handleDelete}
                user={user}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;