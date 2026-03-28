import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserVerification.css';

const UserVerification = ({ user, onVerificationComplete }) => {
  const [verificationStatus, setVerificationStatus] = useState('none');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    idType: 'passport',
    idNumber: '',
    phoneNumber: '',
    documents: []
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
      setFormData(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${user.id}/verification-status`);
      setVerificationStatus(response.data.status || 'none');
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (files) => {
    const uploadedFiles = [];
    
    for (let file of files) {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', user.id);
      formData.append('documentType', 'verification');

      try {
        const response = await axios.post('http://localhost:5000/api/upload/verification-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        uploadedFiles.push({
          name: file.name,
          url: response.data.url,
          type: file.type
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload document');
      }
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...uploadedFiles]
    }));
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`http://localhost:5000/api/users/${user.id}/verify`, formData);
      
      if (response.data.success) {
        setSuccess('Verification submitted successfully! We will review your documents within 24-48 hours.');
        setVerificationStatus('pending');
        
        if (onVerificationComplete) {
          onVerificationComplete(response.data);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <span className="badge badge-success">✓ Verified</span>;
      case 'pending':
        return <span className="badge badge-warning">⏳ Pending</span>;
      case 'rejected':
        return <span className="badge badge-danger">✗ Not Verified</span>;
      default:
        return <span className="badge badge-secondary">? Not Verified</span>;
    }
  };

  if (!user) {
    return (
      <div className="verification-container">
        <div className="login-required">
          <h3>Sign In Required</h3>
          <p>Please sign in to verify your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h2>Account Verification</h2>
        <div className="verification-status">
          Current Status: {getVerificationBadge()}
        </div>
      </div>

      {verificationStatus === 'verified' ? (
        <div className="verified-success">
          <div className="success-icon">✓</div>
          <h3>Your Account is Verified!</h3>
          <p>You have full access to all platform features including bidding, selling, and premium features.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="verification-form">
          <div className="verification-info">
            <h3>Why Verify Your Account?</h3>
            <ul>
              <li>✓ Increased trust and credibility</li>
              <li>✓ Higher bidding limits</li>
              <li>✓ Access to premium features</li>
              <li>✓ Faster payment processing</li>
              <li>✓ Reduced platform fees</li>
            </ul>
          </div>

          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Address Information</h4>
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>State/Province *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>ZIP/Postal Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Identification</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>ID Type *</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Contact Information</h4>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Document Upload</h4>
            <div className="upload-area">
              <input
                type="file"
                id="document-upload"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                style={{ display: 'none' }}
              />
              <label htmlFor="document-upload" className="upload-button">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <p>Click to upload documents</p>
                  <small>Accept: Images (JPG, PNG) and PDF files</small>
                </div>
              </label>
            </div>

            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>{uploadProgress}% uploaded</span>
              </div>
            )}

            {formData.documents.length > 0 && (
              <div className="uploaded-documents">
                <h5>Uploaded Documents:</h5>
                <ul>
                  {formData.documents.map((doc, index) => (
                    <li key={index}>
                      <span className="doc-name">{doc.name}</span>
                      <span className="doc-status">✓ Uploaded</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || formData.documents.length === 0}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Submit Verification'
              )}
            </button>
          </div>

          <div className="verification-notice">
            <p>
              <strong>Privacy Notice:</strong> Your information is encrypted and securely stored. 
              We only use this information for identity verification purposes and will never share 
              it with third parties without your consent.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserVerification;
