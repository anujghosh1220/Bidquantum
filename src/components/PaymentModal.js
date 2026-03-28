import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './PaymentModal.css';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz'); // Replace with your publishable key

const PaymentForm = ({ amount, itemId, onSuccess, onCancel, paymentType = 'auction_bid' }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment intent on backend
      const response = await axios.post('http://localhost:5000/api/payments/create-payment-intent', {
        amount: amount,
        itemId: itemId,
        userId: JSON.parse(localStorage.getItem('user'))?.id || 1,
        paymentType: paymentType
      });

      const { clientSecret, paymentIntentId } = response.data;

      // Confirm payment on frontend
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'BidQuantum User',
          },
        }
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setProcessing(false);
        
        // Confirm payment on backend
        await axios.post('http://localhost:5000/api/payments/confirm-payment', {
          paymentIntentId: paymentIntent.id
        });

        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="payment-amount">
        <h3>Payment Amount</h3>
        <div className="amount-display">
          ${amount.toFixed(2)}
        </div>
      </div>

      <div className="card-element-container">
        <label htmlFor="card-element">Card Details</label>
        <div id="card-element">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="payment-error" role="alert">
          {error}
        </div>
      )}

      {succeeded && (
        <div className="payment-success">
          <h4>Payment Successful!</h4>
          <p>Your transaction has been completed successfully.</p>
        </div>
      )}

      <div className="payment-actions">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={processing || succeeded || !stripe}
        >
          {processing ? (
            <span className="spinner"></span>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Security badges */}
      <div className="security-badges">
        <div className="badge">
          <span>🔒</span>
          <span>Secured by Stripe</span>
        </div>
        <div className="badge">
          <span>🛡️</span>
          <span>SSL Encrypted</span>
        </div>
        <div className="badge">
          <span>💳</span>
          <span>PCI Compliant</span>
        </div>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, amount, itemId, paymentType = 'auction_bid' }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    // You can add additional success handling here
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Secure Payment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-modal-body">
          {user ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                amount={amount}
                itemId={itemId}
                onSuccess={handlePaymentSuccess}
                onCancel={onClose}
                paymentType={paymentType}
              />
            </Elements>
          ) : (
            <div className="login-required">
              <h3>Sign In Required</h3>
              <p>Please sign in to complete your payment.</p>
              <button className="btn btn-primary">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
