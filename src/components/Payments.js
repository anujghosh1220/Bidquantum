import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payments.css';

const CreditCardForm = ({ amount, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please use MM/YY format';
    }
    if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      // Process payment here
      onPaymentSuccess('Credit Card');
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Number</label>
        <input
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
        />
        {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
      </div>
      <div className="form-group">
        <label>Cardholder Name</label>
        <input
          type="text"
          name="cardName"
          value={formData.cardName}
          onChange={handleChange}
          placeholder="John Doe"
        />
        {errors.cardName && <span className="error">{errors.cardName}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength="5"
          />
          {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            type="password"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="123"
            maxLength="4"
          />
          {errors.cvv && <span className="error">{errors.cvv}</span>}
        </div>
      </div>
      <button type="submit" className="pay-now-btn">
        Pay ${amount}
      </button>
    </form>
  );
};

const PayPalForm = ({ amount, onPaymentSuccess }) => {
  const handlePayPalPayment = () => {
    // In a real app, you would integrate with PayPal API here
    onPaymentSuccess('PayPal');
  };

  return (
    <div className="paypal-container">
      <p>You will be redirected to PayPal to complete your payment of ${amount}.</p>
      <button onClick={handlePayPalPayment} className="paypal-button">
        <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" />
      </button>
    </div>
  );
};

const BankTransferForm = ({ amount, onPaymentSuccess }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!/^\d{9,18}$/.test(accountNumber)) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }
    if (!/^\d{9}$/.test(routingNumber)) {
      newErrors.routingNumber = 'Please enter a valid 9-digit routing number';
    }
    if (!accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      // Process bank transfer
      onPaymentSuccess('Bank Transfer');
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Account Holder Name</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="John Doe"
        />
        {errors.accountName && <span className="error">{errors.accountName}</span>}
      </div>
      <div className="form-group">
        <label>Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="1234567890"
        />
        {errors.accountNumber && <span className="error">{errors.accountNumber}</span>}
      </div>
      <div className="form-group">
        <label>Routing Number</label>
        <input
          type="text"
          value={routingNumber}
          onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="123456789"
          maxLength="9"
        />
        {errors.routingNumber && <span className="error">{errors.routingNumber}</span>}
      </div>
      <button type="submit" className="pay-now-btn">
        Pay ${amount}
      </button>
    </form>
  );
};

function Payments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemId, amount } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handlePaymentSuccess = (method) => {
    setPaymentMethod(method);
    setPaymentSuccess(true);
    // In a real app, you would process the payment and update the order status
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return <CreditCardForm amount={amount} onPaymentSuccess={handlePaymentSuccess} />;
      case 'paypal':
        return <PayPalForm amount={amount} onPaymentSuccess={handlePaymentSuccess} />;
      case 'bank':
        return <BankTransferForm amount={amount} onPaymentSuccess={handlePaymentSuccess} />;
      default:
        return null;
    }
  };

  const renderPaymentMethodButtons = () => (
    <div className="payment-options">
      <button 
        type="button" 
        className={`payment-option ${selectedMethod === 'card' ? 'active' : ''}`}
        onClick={() => setSelectedMethod('card')}
      >
        <i className="fas fa-credit-card"></i>
        <span>Credit/Debit Card</span>
      </button>
      <button 
        type="button" 
        className={`payment-option ${selectedMethod === 'paypal' ? 'active' : ''}`}
        onClick={() => setSelectedMethod('paypal')}
      >
        <i className="fab fa-paypal"></i>
        <span>PayPal</span>
      </button>
      <button 
        type="button" 
        className={`payment-option ${selectedMethod === 'bank' ? 'active' : ''}`}
        onClick={() => setSelectedMethod('bank')}
      >
        <i className="fas fa-university"></i>
        <span>Bank Transfer</span>
      </button>
    </div>
  );

  useEffect(() => {
    // Check if we have the required data
    if (!itemId || !amount) {
      // Redirect back to list page if no data is available
      navigate('/list');
    } else {
      setLoading(false);
    }
  }, [itemId, amount, navigate]);

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="payments-page">
        <div className="payments-container success">
          <div className="payment-content">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Payment Successful!</h1>
            <p>Your payment of <strong>${Math.ceil(amount)}</strong> via {paymentMethod} has been processed successfully.</p>
            <p>Item ID: <strong>{itemId}</strong></p>
            <button 
              className="back-to-home"
              onClick={() => navigate('/list')}
            >
              Back to Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="payments-container">
        <div className="payment-content">
          <h1>Complete Your Payment</h1>
          <div className="payment-details">
            <h2>Order Summary</h2>
            <p><strong>Item ID:</strong> {itemId}</p>
            <p><strong>Amount to Pay:</strong> ${Math.ceil(amount)}</p>
          
            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              {renderPaymentMethodButtons()}
              {selectedMethod && (
                <div className="payment-form-container">
                  <h4>{
                    selectedMethod === 'card' ? 'Credit/Debit Card' :
                    selectedMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'
                  }</h4>
                  {renderPaymentForm()}
                </div>
              )}
            </div>

            <div className="payment-actions">
              <button 
                className="pay-now-btn"
                onClick={() => {
                  // Handle payment processing here
                  alert('Payment processing would be implemented here');
                }}
              >
                Pay Now
              </button>
              <button 
                className="cancel-btn"
                onClick={() => navigate('/list')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
