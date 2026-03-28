const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // Create a payment intent for bidding
  async createPaymentIntent(amount, itemId, userId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          itemId: itemId.toString(),
          userId: userId.toString(),
          type: 'auction_bid'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create payment intent for listing fees
  async createListingPaymentIntent(amount, userId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          type: 'listing_fee'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe listing payment intent creation error:', error);
      throw new Error('Failed to create listing payment intent');
    }
  }

  // Confirm payment and handle post-payment logic
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          metadata: paymentIntent.metadata,
          amount: paymentIntent.amount / 100,
        };
      }

      return {
        success: false,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  // Create escrow hold for auction winnings
  async createEscrowHold(amount, itemId, winnerId, sellerId) {
    try {
      // This would typically integrate with a real escrow service
      // For now, we'll create a hold using Stripe's authorization
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        capture_method: 'manual', // This creates an authorization hold
        metadata: {
          itemId: itemId.toString(),
          winnerId: winnerId.toString(),
          sellerId: sellerId.toString(),
          type: 'escrow_hold'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe escrow hold creation error:', error);
      throw new Error('Failed to create escrow hold');
    }
  }

  // Release escrow funds to seller
  async releaseEscrowFunds(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);
      
      return {
        success: true,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe escrow release error:', error);
      throw new Error('Failed to release escrow funds');
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason,
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Create connected account for sellers (for marketplace payouts)
  async createConnectedAccount(sellerData) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: sellerData.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          product_description: 'Auction sales on BidQuantum platform',
          url: 'https://bidquantum.com',
        },
      });

      return {
        accountId: account.id,
        status: account.status,
      };
    } catch (error) {
      console.error('Stripe connected account creation error:', error);
      throw new Error('Failed to create seller account');
    }
  }

  // Create account link for seller onboarding
  async createAccountLink(accountId) {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'https://bidquantum.com/seller/reauth',
        return_url: 'https://bidquantum.com/seller/complete',
        type: 'account_onboarding',
      });

      return {
        url: accountLink.url,
        expires_at: accountLink.expires_at,
      };
    } catch (error) {
      console.error('Stripe account link creation error:', error);
      throw new Error('Failed to create account link');
    }
  }

  // Transfer funds to seller
  async createTransfer(amount, destinationAccountId, transferGroup) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: destinationAccountId,
        transfer_group: transferGroup,
      });

      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        status: transfer.status,
      };
    } catch (error) {
      console.error('Stripe transfer error:', error);
      throw new Error('Failed to transfer funds');
    }
  }
}

module.exports = new StripeService();
