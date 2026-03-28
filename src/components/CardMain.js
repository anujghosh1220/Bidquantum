import React from 'react'
import { Link } from 'react-router-dom';
import { BsFillHeartFill, BsClock, BsTrophy } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import './CardMain.css';

function CardMain({imgSrc, title, hearts, id, onDelete, user, sellerName, currentBid, previousBid, predictedStartingPrice, listDate}) {
  const [showHistory, setShowHistory] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getTimeRemaining = () => {
    // This would normally calculate real time remaining
    return '1d: 12h: 10m';
  };

  return (
    <div 
      className="card_main"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-image-container">
        <img src={imgSrc} alt={title} className="card-image" />
        <div className="card-overlay">
          <div className="overlay-actions">
            <Link to={`/bid/${id}`} className="btn btn-primary btn-sm">
              <AiOutlineEye /> View Details
            </Link>
            {user?.isAdmin && (
              <button 
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        {hearts > 0 && (
          <div className="hearts-badge">
            <BsFillHeartFill /> {hearts}
          </div>
        )}
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {sellerName && (
            <p className="card-seller">by {sellerName}</p>
          )}
        </div>
        
        <div className="card-stats">
          <div className="stat-item">
            <div className="stat-label">
              <BsTrophy /> Current Bid
            </div>
            <div className="stat-value price">
              {formatPrice(currentBid)}
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-label">
              <BsClock /> Time Left
            </div>
            <div className="stat-value countdown">
              {getTimeRemaining()}
            </div>
          </div>
        </div>

        {predictedStartingPrice && user && (
          <div className="card-prediction">
            <span className="prediction-label">AI Prediction:</span>
            <span className="prediction-value">{formatPrice(predictedStartingPrice)}</span>
          </div>
        )}
        
        <div className="card-footer">
          <Link to={`/bid/${id}`} className="bid-button">
            Place Bid
          </Link>
          <button 
            onClick={toggleHistory}
            className="history-toggle"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
        
        {showHistory && (
          <div className="bid-history">
            <h4>Bidding History</h4>
            <div className="history-item">
              <span className="history-label">Current Bid:</span>
              <span className="history-value">{formatPrice(currentBid)}</span>
            </div>
            {previousBid && (
              <div className="history-item">
                <span className="history-label">Previous Bid:</span>
                <span className="history-value">{formatPrice(previousBid)}</span>
              </div>
            )}
            <div className="history-item">
              <span className="history-label">Starting Price:</span>
              <span className="history-value">{formatPrice(predictedStartingPrice)}</span>
            </div>
            <div className="history-item">
              <span className="history-label">Listed:</span>
              <span className="history-value">
                {listDate ? new Date(listDate).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardMain;
