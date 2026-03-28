import React, { useState } from 'react';
import Menu from './Menu';
import './Admin.css';
import axios from 'axios';

function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    hearts: 0,
    currentBid: '',
    previousBid: '',
    listDate: '',
    image: null,
    productDetails: '',
    sellerName: '',
    itemDetail: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prevState => ({
      ...prevState,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Client-side validation
      const validationErrors = [];

      if (!formData.title.trim()) {
        validationErrors.push('Please enter a title for the item.');
      }

      if (!formData.sellerName.trim()) {
        validationErrors.push('Please enter the seller\'s name.');
      }

      if (!formData.itemDetail.trim()) {
        validationErrors.push('Please enter item details.');
      }

      if (!formData.currentBid || parseFloat(formData.currentBid) <= 0) {
        validationErrors.push('Please enter a valid current bid amount.');
      }

      if (!formData.image) {
        validationErrors.push('Please upload an image for the item.');
      }

      if (!formData.listDate) {
        validationErrors.push('Please select a list date.');
      }

      if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
      }

      const formDataToSend = new FormData();
      
      // Add all required fields
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('currentBid', formData.currentBid);
      formDataToSend.append('listDate', formData.listDate);
      formDataToSend.append('sellerName', formData.sellerName.trim());
      formDataToSend.append('itemDetail', formData.itemDetail.trim());
      
      // Add optional fields with defaults
      formDataToSend.append('hearts', formData.hearts || 0);
      formDataToSend.append('productDetails', formData.productDetails || '');
      
      // Add previousBid if provided
      if (formData.previousBid && !isNaN(parseFloat(formData.previousBid))) {
        formDataToSend.append('previousBid', formData.previousBid);
      }

      // Add image
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:5000/api/items/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000 // 10-second timeout
      });

      if (response.status === 201) {
        alert('Item uploaded successfully!');
        
        // Reset form completely
        setFormData({
          title: '',
          hearts: 0,
          currentBid: '',
          previousBid: '',
          listDate: '',
          image: null,
          productDetails: '',
          sellerName: '',
          itemDetail: ''
        });
        
        // Clear file input
        const fileInput = document.getElementById('imageUpload');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      // Detailed error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        let errorMessage = 'Upload failed: ';
        
        // Handle validation errors from the server
        if (error.response.data.errors) {
          // If we have an array of validation errors
          errorMessage += error.response.data.errors.join('\n');
        } else if (error.response.data.message) {
          // If we have a single error message
          errorMessage += error.response.data.message;
        } else if (error.response.data.error) {
          // If we have an error object
          errorMessage += error.response.data.error;
        } else {
          errorMessage += 'Unknown server error';
        }
        
        alert(errorMessage);
      } else {
        console.error('Error details:', error);
        alert('Error uploading item. Please check your inputs and try again. ' + 
              (error.message || ''));
      }
    }
  };

  return (
    <div className="Admin">
      <Menu />
      <div className="adminContainer">
        <div className="adminContent">
          <h1>Upload New Item</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Seller Name</label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Item Details</label>
              <textarea 
                name="itemDetail"
                value={formData.itemDetail}
                onChange={handleInputChange}
                placeholder="Enter item details"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Hearts</label>
              <input 
                type="number"
                name="hearts"
                value={formData.hearts}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Current Bid ($)</label>
              <input 
                type="number"
                name="currentBid"
                value={formData.currentBid}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Previous Bid ($)</label>
              <input 
                type="number"
                name="previousBid"
                value={formData.previousBid}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>List Date</label>
              <input 
                type="date"
                name="listDate"
                value={formData.listDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Image</label>
              <input 
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">Upload Item</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Admin;
