import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import TopContainer from './TopContainer';
import './SellerDashboard.css';
import axios from 'axios';

function SellerDashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [winnersLoading, setWinnersLoading] = useState(true);
    const [bids, setBids] = useState({});

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                console.log('Fetching all products');
                const [itemsResponse, bidsResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/items'),
                    axios.get('http://localhost:5000/api/bids')
                ]);
                
                // Store all bids in state
                const bidsByItem = {};
                bidsResponse.data.forEach(bid => {
                    if (!bidsByItem[bid.itemId]) {
                        bidsByItem[bid.itemId] = [];
                    }
                    bidsByItem[bid.itemId].push(bid);
                });
                setBids(bidsByItem);
                
                // Filter products by sellerName (assuming user.name contains the seller's name)
                const sellerProducts = itemsResponse.data.filter(item => 
                    item.sellerName && user.name && 
                    item.sellerName.toLowerCase() === user.name.toLowerCase()
                );
                
                console.log('Filtered products for seller:', sellerProducts);
                setProducts(sellerProducts);
                setLoading(false);
                setWinnersLoading(false);
                
                // Process winners from bids
                const winnersData = sellerProducts.map(product => {
                    const itemBids = bidsByItem[product._id] || [];
                    const highestBid = itemBids.length > 0 
                        ? itemBids.reduce((max, bid) => bid.bidAmount > max.bidAmount ? bid : max, itemBids[0])
                        : null;
                    
                    return highestBid ? {
                        productId: product._id,
                        productTitle: product.title,
                        winnerName: highestBid.username,
                        winningBid: highestBid.bidAmount,
                        sellerName: product.sellerName
                    } : null;
                }).filter(winner => winner !== null);
                
                setWinners(winnersData);
            } catch (error) {
                console.error('Error fetching data:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setProducts([]);
                setWinners([]);
                setLoading(false);
                setWinnersLoading(false);
            }
        };

        if (user?.name) {
            console.log('User object:', user);
            fetchAllProducts();
        } else {
            console.log('No user name found');
            setLoading(false);
            setWinnersLoading(false);
        }
    }, [user]);

    return (
        <div className="seller-dashboard">
            <Menu user={user} onLogout={onLogout} />
            <div className="dashboard-content">
                <TopContainer user={user} onSignOut={onLogout} />
                <div className="dashboard-main">
                    <h2><center>Seller Dashboard</center></h2>
                    <div className="seller-products">
                        <div className="products-section">
                            <h3>Your Products</h3>
                            {loading ? (
                                <div className="loading">Loading products...</div>
                            ) : products.length > 0 ? (
                                <div className="items-tables-container">
                                    {products.map((item) => (
                                        <div key={item._id} className="item-table-wrapper">
                                            <h3 className="item-title">{item.title}</h3>
                                            <table className="item-details-table">
                                                <tbody>
                                                    <tr>
                                                        <th>Description:</th>
                                                        <td>{item.description || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Starting Price:</th>
                                                        <td>${item.startingPrice?.toFixed(2) || '0.00'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Current Bid:</th>
                                                        <td>
                                                            {bids[item._id]?.length > 0 ? (
                                                                <>
                                                                    ${bids[item._id].reduce((max, bid) => Math.max(max, bid.bidAmount), 0).toFixed(2)}
                                                                    <div className="bidder-info">
                                                                        (Highest bidder: {bids[item._id].reduce((max, bid) => bid.bidAmount > (max?.bidAmount || 0) ? bid : max, null)?.username || 'N/A'})
                                                                    </div>
                                                                </>
                                                            ) : 'No bids yet'}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>End Time:</th>
                                                        <td>{new Date(item.endTime).toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Status:</th>
                                                        <td className={`status-${item.status?.toLowerCase() || 'active'}`}>
                                                            {item.status || 'Active'}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-products">
                                    <p>No products found. Start by adding a new item to sell.</p>
                                </div>
                            )}
                        </div>

                        <div className="winners-section">
                            <h3>Auction Winners</h3>
                            {winnersLoading ? (
                                <div className="loading">Loading winner information...</div>
                            ) : winners.length > 0 ? (
                                <table className="winners-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Winner</th>
                                            <th>Bid Amount</th>
                                            <th>Seller</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {winners.map((winner, index) => (
                                            <tr key={index}>
                                                <td>{winner.productTitle}</td>
                                                <td>{winner.winnerName || 'N/A'}</td>
                                                <td>${winner.winningBid?.toFixed(2) || '0.00'}</td>
                                                <td>{user.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="no-winners">
                                    <p>No completed auctions with winners yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
