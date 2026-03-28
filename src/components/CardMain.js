import React from 'react'
import { Link } from 'react-router-dom';
import { BsFillHeartFill } from "react-icons/bs";

function CardMain({imgSrc, title, hearts, id, onDelete, user, sellerName, currentBid, previousBid, predictedStartingPrice, listDate}) {
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
    <div className="card_main">
      <img src={imgSrc} alt="" />
      <div className="card_main_name">
        <h2>{title}</h2>
        {sellerName && (
          <h2 style={{ fontSize: '14px', margin: 0, color: '#adabb8', fontWeight: 'normal' }}>{sellerName}</h2>
        )}
        <div className="card_icon">
          <i>
            <BsFillHeartFill /> <span>{hearts}</span>
          </i>
        </div>
      </div>
      
      <div className="stats">
        <p>Current Bid <span> ${currentBid || 0} </span></p>
        <p>Ending In: <span> 1d: 12h: 10m </span></p>
      </div>

      <div className="card_button">
        <Link to={`/bid/${id}`} className="button1 btn">Place Bid</Link>
        {user?.isAdmin ? (
          <a href=" " className="button2 btn delete-btn" onClick={handleDelete}>Delete</a>
        ) : (
          <a href=" " className="button2 btn" onClick={toggleHistory}>History</a>
        )}
      </div>

      {!user?.isAdmin && showHistory && (
        <div className="history_dropdown">
          <div className="bid_history">
            <p><strong>Current Bid:</strong> ${currentBid || 0}</p>
            <p><strong>Previous Bid:</strong> ${previousBid || 0}</p>
            <p><strong>Starting Price:</strong> ${predictedStartingPrice || 0}</p>
            <p><strong>Listed On:</strong> {listDate ? new Date(listDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardMain;
