---
title: Revenue Attribution
description: How Zori connects payments to traffic sources
---

Revenue attribution is the core of Zori - connecting every dollar of revenue to the marketing channel that brought the customer.

## The Attribution Chain

```
Traffic Source → Visitor ID → Payment Metadata → Revenue Attribution
     ↓               ↓              ↓                    ↓
  (utm_source)  (cookie)    (zori_visitor_id)    (twitter: $500)
```

### Step 1: Capture Traffic Source

When a visitor arrives, Zori captures their origin:

```javascript
// Visitor arrives from: yoursite.com?utm_source=twitter&utm_campaign=launch

// Zori automatically captures:
{
  utm_source: "twitter",
  utm_campaign: "launch",
  utm_medium: "paid_social",
  referrer: "https://twitter.com/...",
  landing_page: "/pricing"
}
```

### Step 2: Assign Visitor ID

A unique `zori_visitor_id` is assigned and stored as a cookie:

```
Cookie: zori_visitor_id=vis_a1b2c3d4e5f6
Expiry: 2 years
```

This ID persists across sessions, even if the visitor returns days or weeks later.

### Step 3: Track the Journey

All subsequent activity is linked to this visitor ID:

```javascript
// Page views
{ visitor_id: "vis_a1b2c3", event: "page_view", page: "/pricing" }
{ visitor_id: "vis_a1b2c3", event: "page_view", page: "/features" }

// Clicks
{ visitor_id: "vis_a1b2c3", event: "click", element: "Sign Up button" }

// Sessions
{ visitor_id: "vis_a1b2c3", session_id: "ses_xyz", duration: 542000 }
```

### Step 4: Pass to Payment

When the visitor makes a purchase, include their visitor ID:

```javascript
// Frontend: Get the visitor ID
const visitorId = await window.ZoriHQ.getVisitorId();

// Frontend: Send to your server
const response = await fetch('/api/create-checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cartItems,
    zori_visitor_id: visitorId  // Include this!
  })
});
```

```javascript
// Backend: Include in Stripe metadata
const session = await stripe.checkout.sessions.create({
  line_items: items,
  metadata: {
    zori_visitor_id: req.body.zori_visitor_id
  },
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cart'
});
```

### Step 5: Receive Payment Webhook

Stripe sends a webhook when payment succeeds:

```json
{
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_xxx",
      "amount": 9900,
      "metadata": {
        "zori_visitor_id": "vis_a1b2c3d4e5f6"
      }
    }
  }
}
```

### Step 6: Attribute Revenue

Zori processes the webhook:

1. Extracts `zori_visitor_id` from metadata
2. Looks up the visitor's first-touch data
3. Links the $99 payment to the original traffic source

**Result:** Twitter campaign credited with $99 revenue.

## Where to Pass Visitor ID

### Stripe Checkout

```javascript
const session = await stripe.checkout.sessions.create({
  metadata: {
    zori_visitor_id: visitorId
  }
});
```

### Stripe Subscriptions

```javascript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_xxx' }],
  metadata: {
    zori_visitor_id: visitorId
  }
});
```

### Stripe Payment Intents

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  metadata: {
    zori_visitor_id: visitorId
  }
});
```

### Stripe Invoices

For subscriptions, also add to the subscription metadata:

```javascript
// The subscription metadata flows to invoice payments
const subscription = await stripe.subscriptions.create({
  metadata: {
    zori_visitor_id: visitorId  // This metadata appears on invoices
  }
});
```

## Common Patterns

### User Signup Flow

```javascript
// 1. User signs up
async function handleSignup(email, password) {
  const visitorId = await window.ZoriHQ.getVisitorId();

  // Store visitor ID with user account
  await createUser({
    email,
    password,
    zori_visitor_id: visitorId
  });

  // Identify the visitor
  await window.ZoriHQ.identify({
    app_id: newUser.id,
    email
  });
}

// 2. Later, when they purchase
async function handlePurchase(userId) {
  const user = await getUser(userId);

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    metadata: {
      zori_visitor_id: user.zori_visitor_id  // Use stored ID
    }
  });
}
```

### Anonymous Checkout

```javascript
// No account needed - just pass visitor ID
async function handleAnonymousCheckout(cart) {
  const visitorId = await window.ZoriHQ.getVisitorId();

  const session = await stripe.checkout.sessions.create({
    line_items: cart,
    metadata: {
      zori_visitor_id: visitorId
    }
  });
}
```

### Upgrading Free Users

```javascript
// User signed up free, now upgrading
async function handleUpgrade(userId, planId) {
  const user = await getUser(userId);

  // Even if they signed up months ago, use original visitor ID
  const subscription = await stripe.subscriptions.create({
    customer: user.stripe_customer_id,
    items: [{ price: planId }],
    metadata: {
      zori_visitor_id: user.zori_visitor_id
    }
  });
}
```

## What Gets Attributed

| Stripe Event | Attributed |
|--------------|------------|
| `charge.succeeded` | Yes |
| `invoice.payment_succeeded` | Yes |
| `checkout.session.completed` | Via charge |
| `subscription.created` | Via first invoice |

## Troubleshooting

### Revenue Not Appearing

1. **Check metadata**: Is `zori_visitor_id` in the Stripe payment?
2. **Check webhook**: Is Zori receiving Stripe webhooks?
3. **Check visitor**: Does the visitor exist in Zori?

### Wrong Attribution

1. **Check timing**: Did the visitor ID exist before the first touch?
2. **Check cookies**: Are cookies being blocked?
3. **Check identification**: Was `identify()` called incorrectly?

### Missing Visitor ID

```javascript
// Always have a fallback
const visitorId = await window.ZoriHQ.getVisitorId();

if (!visitorId) {
  console.warn('No visitor ID available - attribution will be lost');
  // Consider: generate a fallback ID, or proceed without
}
```

## Best Practices

1. **Store visitor ID at signup** - Don't rely on the cookie still existing
2. **Pass to every payment** - Subscriptions, one-time, upgrades
3. **Call identify() on login** - Links returning users to their history
4. **Test the flow** - Verify attribution is working end-to-end

## Next Steps

- [Stripe Integration](/integrations/stripe/) - Complete setup guide
- [How It Works](/concepts/how-it-works/) - System architecture
- [JavaScript API](/tracking/javascript-api/) - API reference
