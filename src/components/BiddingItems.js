import React from 'react';
import './Cpmponents/BiddingItems.css';

function BiddingItems() {
  return (
    <div className="bidding-container">
      <h1 className="heading">Items for Bidding</h1>
      <div className="main">
        <ul>
          <li className="logo">
            <a href="mainPage.html">
              <img src="earth-globe.png" alt="Logo" style={{ width: '36px', height: '36px' }} />
            </a>
          </li>
        </ul>
        <ul className="list2">
          <li className="active-menu">
            <a href="mainPage.html" className="animated-button">Home</a>
          </li>
          <li>
            <a id="long" href="destination.html" className="animated-button">Destination</a>
          </li>
          <li>
            <a href="gallery.html" className="animated-button">Gallery</a>
          </li>
          <li>
            <a href="feedback.html" className="animated-button">Feedback</a>
          </li>
          <li>
            <a href="index.html" className="animated-button">Logout</a>
          </li>
        </ul>
      </div>
      <div className="container">
        <div className="box">
          <div className="imgBox">
            <img src="images/destination/goa1.jpg" alt="Goa" style={{ width: 'auto', height: '270px' }} />
          </div>
          <div className="name-text name-pading1 top1">
            <h1>Goa</h1>
            <form method="POST" action="info.php">
              <input type="submit" name="goa" className="btn1" value="Visit" />
            </form>
          </div>
        </div>
        {/* Repeat similar blocks for other items (Kerala, Mysore, Ladakh) */}
      </div>
    </div>
  );
}

export default BiddingItems;
