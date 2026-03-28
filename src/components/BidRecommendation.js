import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BidRecommendation.css';

function BidRecommendation({ user, itemId, currentBid, predictedStartingPrice }) {
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && itemId) {
            fetchRecommendation();
        }
    }, [user, itemId, currentBid]);

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/analytics/recommendation/${user.id}/${itemId}`
            );
            setRecommendation(response.data);
        } catch (error) {
            console.error('Error fetching recommendation:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="recommendation-loading">Analyzing your bidding pattern...</div>;
    }

    if (!recommendation || !recommendation.showRecommendation) {
        return null; // Don't show anything for new users
    }

    const { recommendedBid, confidence, strategy, reasoning, userStats } = recommendation;

    return (
        <div className="bid-recommendation">
            <div className="recommendation-header">
                <h4>🧠 Intelligent Bid Recommendation</h4>
                <div className="confidence-badge">
                    Confidence: {confidence}%
                </div>
            </div>
            
            <div className="recommendation-content">
                <div className="recommended-bid">
                    <span className="bid-label">Recommended Bid:</span>
                    <span className="bid-amount">${recommendedBid.toLocaleString()}</span>
                </div>
                
                <div className="recommendation-reasoning">
                    <p><strong>Strategy:</strong> {strategy.replace('_', ' ')}</p>
                    <p><strong>Analysis:</strong> {reasoning}</p>
                </div>
                
                <div className="user-stats">
                    <h5>Your Bidding History:</h5>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{userStats.totalBids}</span>
                            <span className="stat-label">Total Bids</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{userStats.wonBids}</span>
                            <span className="stat-label">Won</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{userStats.lostBids}</span>
                            <span className="stat-label">Lost</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{userStats.winRate}%</span>
                            <span className="stat-label">Win Rate</span>
                        </div>
                    </div>
                </div>
                
                <div className="recommendation-actions">
                    <button 
                        className="apply-recommendation-btn"
                        onClick={() => {
                            // This will be handled by the parent component
                            const event = new CustomEvent('applyRecommendation', { 
                                detail: { amount: recommendedBid } 
                            });
                            window.dispatchEvent(event);
                        }}
                    >
                        Apply Recommendation
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BidRecommendation;
