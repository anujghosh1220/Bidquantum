import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MainRightTop() {
    const [stats, setStats] = useState({
        itemsSold: 0,
        itemsCancelled: 0,
        itemsPending: 0,
        itemsDelivered: 0,
        totalEarnings: 0
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/statistics');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    return (
      <div className="topCard">
        <div className="topCard_name">
          <h2>Statistics</h2>
          <a href="example">View More</a>
        </div>
        <div className="earnings">
          <p>Items Sold <span>{stats.itemsSold}</span></p>
          <p>Items Cancelled <span>{stats.itemsCancelled}</span></p>
          <p>Items Pending <span>{stats.itemsPending}</span></p>
          <p>Items Delivered <span>{stats.itemsDelivered}</span></p>
          <p>Total Earnings <span>${stats.totalEarnings.toLocaleString()}</span></p>
        </div>
      </div>
    );
  }
  
  export default MainRightTop;