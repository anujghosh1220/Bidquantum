import React, { useState } from 'react';
import axios from 'axios';
import './Admin.css';

function AdminUpload() {
  const [title, setTitle] = useState('');
  const [currentBid, setCurrentBid] = useState('');
  const [previousBid, setPreviousBid] = useState('');
  const [image, setImage] = useState(null);
  const [hearts, setHearts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!title || !currentBid || !image) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('currentBid', parseFloat(currentBid));
    
    // Only append previousBid if it's a valid number
    if (previousBid && !isNaN(parseFloat(previousBid))) {
      formData.append('previousBid', parseFloat(previousBid));
    }
    
    formData.append('hearts', hearts);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/items/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Item added successfully!');
      
      // Reset form
      setTitle('');
      setCurrentBid('');
      setPreviousBid('');
      setImage(null);
      setHearts(0);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="Admin">
      <Menu />
      <div className="adminContainer">
        <div className="adminContent">
          <h1>Upload New Item</h1>
          <p>Please use the Admin panel to upload new items.</p>
          <div className="admin-upload-container">
            <form onSubmit={handleSubmit} className="admin-upload-form">
              <h2>Add New Auction Item</h2>
              
              <div className="form-group">
                <label>Item Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Current Bid Amount</label>
                <input 
                  type="number" 
                  value={currentBid} 
                  onChange={(e) => setCurrentBid(e.target.value)} 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Previous Bid Amount (Optional)</label>
                <input 
                  type="number" 
                  value={previousBid} 
                  onChange={(e) => setPreviousBid(e.target.value)} 
                  min="0" 
                  step="0.01" 
                />
              </div>

              <div className="form-group">
                <label>Hearts</label>
                <input 
                  type="number" 
                  value={hearts} 
                  onChange={(e) => setHearts(parseInt(e.target.value) || 0)} 
                  min="0" 
                />
              </div>

              <div className="form-group">
                <label>Item Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  required 
                />
              </div>

              <button type="submit" className="submit-btn">Add Item</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;