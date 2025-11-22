---
title: Quickstart
description: Get Zori running in 5 minutes
---

This guide gets you from zero to tracking revenue attribution in 5 minutes.

## Prerequisites

- A website or web app
- A Stripe account (for revenue tracking)
- Docker (for self-hosting) or use Zori Cloud

## Step 1: Deploy Zori Backend

### Option A: Docker (Recommended)

```bash
git clone https://github.com/ZoriHQ/zori.git
cd zori
cp example.env .env
docker-compose up -d
```

### Option B: Manual Setup

See the [Manual Setup Guide](/self-hosting/manual/) for detailed instructions.

## Step 2: Add the Tracking Script

Add this to your website's `<head>`:

```html
<!-- Initialize queue first -->
<script>
  window.ZoriHQ = window.ZoriHQ || [];
</script>

<!-- Load script asynchronously -->
<script async src="https://cdn.zorihq.com/script.min.js"
        data-key="your-publishable-key"></script>
```

The script will automatically track:
- Page views
- Clicks
- Sessions
- UTM parameters
- Referrers

## Step 3: Connect Stripe

1. Go to your Zori dashboard
2. Navigate to Settings > Integrations
3. Click "Connect Stripe"
4. Authorize the connection

## Step 4: Pass Visitor ID in Payments

When creating a Stripe checkout or subscription, include the `zori_visitor_id` in metadata:

```javascript
// Get the visitor ID from Zori
const visitorId = await window.ZoriHQ.getVisitorId();

// Pass it to your backend, then include in Stripe checkout
const session = await stripe.checkout.sessions.create({
  // ... your checkout config
  metadata: {
    zori_visitor_id: visitorId
  }
});
```

This is the critical step that connects revenue to traffic sources.

## Step 5: See the Truth

Once payments start flowing, you'll see exactly which channels drive revenue:

| Source | Visitors | Revenue |
|--------|----------|---------|
| Twitter Ads | 10,241 | $0 |
| Blog Post | 847 | $12,400 |
| Google | 3,102 | $4,200 |

## Next Steps

- [Self-Hosting Guide](/self-hosting/requirements/) - Full deployment options
- [Tracking Script Reference](/tracking/installation/) - All tracking features
- [Stripe Integration](/integrations/stripe/) - Detailed payment setup
- [How It Works](/concepts/how-it-works/) - Understanding the attribution model
