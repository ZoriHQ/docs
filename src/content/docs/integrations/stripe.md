---
title: Stripe Integration
description: Connect Stripe to attribute revenue to traffic sources
---

Zori integrates with Stripe to automatically attribute payments to their original traffic sources.

## How It Works

1. Visitor arrives with tracking (UTM params, referrer)
2. Zori assigns a `visitor_id` cookie
3. When visitor purchases, you pass `visitor_id` to Stripe as metadata
4. Stripe sends payment webhook to Zori
5. Zori extracts `visitor_id` and credits the original traffic source

## Setup

### 1. Connect Stripe to Zori

**For Self-Hosted:**

Go to your Zori dashboard and add your Stripe credentials:

- **API Key**: Your Stripe secret key (`sk_live_...` or `sk_test_...`)
- **Webhook Secret**: The signing secret for your webhook endpoint

**For Zori Cloud:**

Use OAuth to connect:

1. Go to Settings > Integrations
2. Click "Connect Stripe"
3. Authorize in Stripe

### 2. Configure Stripe Webhook

Create a webhook endpoint in Stripe Dashboard:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Self-hosted: `https://your-domain.com:1323/webhooks/stripe/{project_id}`
   - Zori Cloud: Automatically configured
4. Select events to listen for:
   - `charge.succeeded`
   - `invoice.payment_succeeded`
5. Copy the signing secret to Zori

### 3. Pass Visitor ID in Payments

This is the critical step - include `zori_visitor_id` in Stripe metadata.

## Implementation Examples

### Checkout Sessions

```javascript
// Frontend
async function startCheckout(cartItems) {
  const visitorId = await window.ZoriHQ.getVisitorId();

  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems,
      zori_visitor_id: visitorId,
    }),
  });

  const { url } = await response.json();
  window.location.href = url;
}
```

```javascript
// Backend (Node.js)
app.post('/api/create-checkout', async (req, res) => {
  const { items, zori_visitor_id } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    metadata: {
      zori_visitor_id,  // CRITICAL for attribution
    },
    success_url: `${process.env.BASE_URL}/success`,
    cancel_url: `${process.env.BASE_URL}/cart`,
  });

  res.json({ url: session.url });
});
```

### Subscriptions

```javascript
// Frontend
async function subscribe(priceId) {
  const visitorId = await window.ZoriHQ.getVisitorId();

  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      zori_visitor_id: visitorId,
    }),
  });

  const { clientSecret } = await response.json();
  // Complete with Stripe.js...
}
```

```javascript
// Backend
app.post('/api/create-subscription', async (req, res) => {
  const { priceId, zori_visitor_id } = req.body;

  const subscription = await stripe.subscriptions.create({
    customer: req.user.stripeCustomerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      zori_visitor_id,  // Will be on all future invoices
    },
  });

  res.json({
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  });
});
```

### Payment Intents

```javascript
// Backend
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, zori_visitor_id } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      zori_visitor_id,
    },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

### Stripe Elements (React)

```jsx
import { useZori } from '@zorihq/react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const { getVisitorId } = useZori();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const visitorId = await getVisitorId();

    // Create PaymentIntent with visitor ID
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        zori_visitor_id: visitorId,
      }),
    });

    const { clientSecret } = await response.json();

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pay</button>
    </form>
  );
}
```

## Storing Visitor ID with Users

For returning users, store the visitor ID when they sign up:

```javascript
// On signup
async function handleSignup(email, password) {
  const visitorId = await window.ZoriHQ.getVisitorId();

  const user = await createUser({
    email,
    password,
    zori_visitor_id: visitorId,  // Store for future purchases
  });

  // Also identify in Zori
  await window.ZoriHQ.identify({
    app_id: user.id,
    email: user.email,
  });

  return user;
}

// On future purchases
async function handlePurchase(userId) {
  const user = await getUser(userId);

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    metadata: {
      zori_visitor_id: user.zori_visitor_id,  // Use stored ID
    },
    // ...
  });
}
```

## Webhook Events

Zori processes these Stripe webhook events:

| Event | Description |
|-------|-------------|
| `charge.succeeded` | One-time payments |
| `invoice.payment_succeeded` | Subscription payments |

### Webhook Security

Zori validates every webhook using Stripe's signature:

```go
// Internally, Zori does this:
event, err := webhook.ConstructEvent(payload, signature, webhookSecret)
if err != nil {
    // Invalid signature - reject
}
```

## Subscription Metadata

For subscriptions, metadata flows to invoices automatically:

```javascript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  metadata: {
    zori_visitor_id: visitorId,
  },
});

// When Stripe creates monthly invoices, they inherit this metadata
// So recurring payments are attributed to the original traffic source
```

## Testing

### Test Mode

Use Stripe test mode keys during development:

```bash
# .env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Local Webhook Testing

Use Stripe CLI to forward webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:1323/webhooks/stripe/your-project-id
```

### Test a Payment

```bash
# Trigger a test payment event
stripe trigger charge.succeeded
```

## Troubleshooting

### No Revenue in Dashboard

1. **Check webhook delivery**: Stripe Dashboard > Webhooks > Recent events
2. **Check metadata**: Click on a charge, verify `zori_visitor_id` is present
3. **Check visitor exists**: The visitor must have visited your site
4. **Check webhook secret**: Must match between Stripe and Zori

### Missing Metadata

If you're not seeing `zori_visitor_id` in payments:

```javascript
// Debug: log before creating payment
const visitorId = await window.ZoriHQ.getVisitorId();
console.log('Visitor ID:', visitorId);  // Should not be null/undefined
```

### Webhook Signature Errors

- Verify your webhook secret is correct
- Ensure you're using the raw request body (not parsed JSON)
- Check the webhook URL matches exactly

## Next Steps

- [Revenue Attribution](/concepts/revenue-attribution/) - Understanding the attribution model
- [How It Works](/concepts/how-it-works/) - System architecture
- [Self-Hosting](/self-hosting/requirements/) - Deploy Zori yourself
