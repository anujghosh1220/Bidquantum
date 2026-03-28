const express = require('express');
const router = express.Router();
const stripeService = require('../config/stripe');
const { runQuery } = require('../config/database');

// Create payment intent for bidding
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, itemId, userId } = req.body;

    if (!amount || !itemId || !userId) {
      return res.status(400).json({ 
        message: 'Amount, itemId, and userId are required' 
      });
    }

    // Verify user exists
    const userCheck = await runQuery(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify item exists
    const itemCheck = await runQuery(
      'SELECT id FROM items WHERE id = ?',
      [itemId]
    );

    if (itemCheck.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const paymentIntent = await stripeService.createPaymentIntent(
      amount, 
      itemId, 
      userId
    );

    res.json(paymentIntent);
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Create payment intent for listing fees
router.post('/create-listing-payment', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ 
        message: 'Amount and userId are required' 
      });
    }

    const paymentIntent = await stripeService.createListingPaymentIntent(
      amount, 
      userId
    );

    res.json(paymentIntent);
  } catch (error) {
    console.error('Listing payment creation error:', error);
    res.status(500).json({ message: 'Failed to create listing payment' });
  }
});

// Confirm payment and update database
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        message: 'Payment intent ID is required' 
      });
    }

    const result = await stripeService.confirmPayment(paymentIntentId);

    if (result.success) {
      // Update payment status in database
      await runQuery(
        `UPDATE payments 
         SET status = 'completed', 
             processed_at = CURRENT_TIMESTAMP 
         WHERE payment_intent_id = ?`,
        [paymentIntentId]
      );

      // If it's an auction bid, update bid status
      if (result.metadata.type === 'auction_bid') {
        await runQuery(
          `UPDATE bids 
           SET payment_status = 'paid', 
               payment_intent_id = ? 
           WHERE item_id = ? AND user_id = ?`,
          [paymentIntentId, result.metadata.itemId, result.metadata.userId]
        );
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: result
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not successful',
        status: result.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Create escrow hold for auction winner
router.post('/create-escrow-hold', async (req, res) => {
  try {
    const { amount, itemId, winnerId, sellerId } = req.body;

    if (!amount || !itemId || !winnerId || !sellerId) {
      return res.status(400).json({ 
        message: 'Amount, itemId, winnerId, and sellerId are required' 
      });
    }

    const escrowHold = await stripeService.createEscrowHold(
      amount, 
      itemId, 
      winnerId, 
      sellerId
    );

    // Record escrow hold in database
    await runQuery(
      `INSERT INTO escrow_holds 
       (payment_intent_id, item_id, winner_id, seller_id, amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'hold', CURRENT_TIMESTAMP)`,
      [escrowHold.paymentIntentId, itemId, winnerId, sellerId, amount]
    );

    res.json(escrowHold);
  } catch (error) {
    console.error('Escrow hold creation error:', error);
    res.status(500).json({ message: 'Failed to create escrow hold' });
  }
});

// Release escrow funds to seller
router.post('/release-escrow-funds', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        message: 'Payment intent ID is required' 
      });
    }

    const result = await stripeService.releaseEscrowFunds(paymentIntentId);

    if (result.success) {
      // Update escrow status in database
      await runQuery(
        `UPDATE escrow_holds 
         SET status = 'released', 
             released_at = CURRENT_TIMESTAMP 
         WHERE payment_intent_id = ?`,
        [paymentIntentId]
      );

      res.json({
        success: true,
        message: 'Escrow funds released successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to release escrow funds'
      });
    }
  } catch (error) {
    console.error('Escrow release error:', error);
    res.status(500).json({ message: 'Failed to release escrow funds' });
  }
});

// Process refund
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        message: 'Payment intent ID is required' 
      });
    }

    const refund = await stripeService.refundPayment(
      paymentIntentId, 
      reason || 'requested_by_customer'
    );

    if (refund.success) {
      // Update payment status in database
      await runQuery(
        `UPDATE payments 
         SET status = 'refunded', 
             refund_id = ?, 
             refunded_at = CURRENT_TIMESTAMP 
         WHERE payment_intent_id = ?`,
        [refund.refundId, paymentIntentId]
      );

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: refund
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to process refund'
      });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Create seller connected account
router.post('/create-seller-account', async (req, res) => {
  try {
    const { userId, email, businessInfo } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        message: 'User ID and email are required' 
      });
    }

    const account = await stripeService.createConnectedAccount({
      email,
      ...businessInfo
    });

    // Save account info to database
    await runQuery(
      `UPDATE users 
       SET stripe_account_id = ?, 
           seller_status = 'pending' 
       WHERE id = ?`,
      [account.accountId, userId]
    );

    // Create onboarding link
    const accountLink = await stripeService.createAccountLink(account.accountId);

    res.json({
      accountId: account.accountId,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expires_at
    });
  } catch (error) {
    console.error('Seller account creation error:', error);
    res.status(500).json({ message: 'Failed to create seller account' });
  }
});

// Get payment history for user
router.get('/payment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await runQuery(
      `SELECT p.*, i.title as item_title, u.username as seller_name
       FROM payments p
       LEFT JOIN items i ON p.item_id = i.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(payments);
  } catch (error) {
    console.error('Payment history retrieval error:', error);
    res.status(500).json({ message: 'Failed to retrieve payment history' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // Update database, send notifications, etc.
      break;
    
    case 'payment_intent.payment_failed':
      console.log('PaymentIntent failed!');
      // Handle failed payment
      break;
    
    case 'account.updated':
      const account = event.data.object;
      console.log('Account updated:', account.id);
      // Update seller status in database
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
