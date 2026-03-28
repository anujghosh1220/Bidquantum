import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MainRightBottom() {
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    fetchTopSellers();
  }, []);

  const fetchTopSellers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/top-sellers');
      setTopSellers(response.data);
    } catch (error) {
      console.error('Error fetching top sellers:', error);
    }
  };

  return (
    <div className="bottomRightCard">
      <div className="bottomName">
        <h2>Top Seller</h2>
        <a href=" ">View More</a>
      </div>

      {topSellers.map((seller) => (
        <div className="topSeller" key={seller.id}>
          <div className="topSellerImg">
            <img src={seller.imgSrc} alt={seller.seller_name} />
          </div>
          <p className="topSellerName">
            {seller.seller_name}
            <span>{seller.username}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default MainRightBottom;
