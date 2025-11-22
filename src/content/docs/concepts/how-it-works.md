---
title: How It Works
description: Understanding Zori's tracking and attribution system
---

Zori connects visitor behavior to revenue by tracking the complete journey from first click to purchase.

## The Attribution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VISITOR JOURNEY                              │
└─────────────────────────────────────────────────────────────────────┘

1. ARRIVAL
   ┌──────────────────────────────────────────────────────────────────┐
   │  Visitor clicks ad (utm_source=twitter, utm_campaign=launch)     │
   │  → Zori assigns zori_visitor_id cookie                           │
   │  → Records first-touch attribution (traffic source, referrer)    │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
2. ENGAGEMENT
   ┌──────────────────────────────────────────────────────────────────┐
   │  Visitor browses your site over days/weeks                       │
   │  → Every page view tracked                                       │
   │  → Every click captured                                          │
   │  → Session data collected                                        │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
3. IDENTIFICATION (Optional)
   ┌──────────────────────────────────────────────────────────────────┐
   │  Visitor signs up or logs in                                     │
   │  → identify() links visitor_id to user account                   │
   │  → Historical events connected to user                           │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
4. PURCHASE
   ┌──────────────────────────────────────────────────────────────────┐
   │  Visitor starts checkout                                         │
   │  → Your app calls getVisitorId()                                 │
   │  → visitor_id passed to Stripe as metadata                       │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
5. ATTRIBUTION
   ┌──────────────────────────────────────────────────────────────────┐
   │  Stripe sends webhook on payment                                 │
   │  → Zori extracts zori_visitor_id from metadata                   │
   │  → Links payment to original traffic source                      │
   │  → "Twitter ad brought $99 revenue"                              │
   └──────────────────────────────────────────────────────────────────┘
```

## Architecture

```
┌──────────┐     ┌──────────┐
│ browser  │────▶│ingestion │──┐
└──────────┘     └──────────┘  │
                                ▼
┌──────────┐     ┌──────────┐  NATS
│  stripe  │────▶│ api srv  │◀─┘
└──────────┘     └──────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │postgres │  │clickhouse│  │  redis  │
   └─────────┘  └──────────┘  └─────────┘
    (who you)    (what did)    (cache)
```

### Components

| Component | Purpose |
|-----------|---------|
| **Ingestion Server** | Receives events from browsers, queues for processing |
| **API Server** | Dashboard API, Stripe webhooks, analytics queries |
| **PostgreSQL** | User accounts, projects, payment providers |
| **ClickHouse** | Event storage, time-series analytics |
| **Redis** | Caching, rate limiting |
| **NATS** | Message queue for event processing |

## What Gets Tracked

### Automatic Tracking

The Zori script automatically captures:

- **Page Views** - Every page visited with title, path, search params
- **Clicks** - All clicks with element info, coordinates, destinations
- **Sessions** - Start, end, duration, page count
- **First Touch** - Initial traffic source (UTM params, referrer)
- **Fingerprint** - Browser characteristics for visitor identification

### Manual Tracking

You can track custom events:

```javascript
// Track any custom event
window.ZoriHQ.track('feature_used', {
  feature_name: 'dark_mode',
  setting: 'enabled'
});

// Identify users
window.ZoriHQ.identify({
  app_id: 'user_123',
  email: 'user@example.com'
});
```

## First-Touch Attribution

Zori uses **first-touch attribution** - the original traffic source gets credit for the conversion.

### Why First-Touch?

1. **Acquisition is expensive** - Know which channels bring customers
2. **Clear causality** - What first introduced them to you?
3. **Simple and actionable** - Easy to make decisions

### Example

```
Day 1:  Visitor clicks Twitter ad → visits site → leaves
Day 5:  Same visitor types URL directly → browses
Day 12: Same visitor comes from Google → purchases

Attribution: Twitter gets credit (first touch)
```

## The Critical Connection

The key to revenue attribution is passing the `zori_visitor_id` when creating payments:

### In Your Frontend

```javascript
const visitorId = await window.ZoriHQ.getVisitorId();

// Send to your backend
await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cart,
    zori_visitor_id: visitorId  // THIS IS CRITICAL
  })
});
```

### In Your Backend

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: items,
  metadata: {
    zori_visitor_id: visitorId  // Include in Stripe metadata
  },
  // ...
});
```

### When Stripe Processes Payment

1. Stripe sends webhook to Zori
2. Zori extracts `zori_visitor_id` from metadata
3. Looks up original traffic source for that visitor
4. Attributes revenue to that source

## Data Flow Timeline

```
Time 0ms:   Visitor arrives on your site
Time 10ms:  Zori script loads
Time 50ms:  Fingerprint generated, visitor_id assigned
Time 100ms: First page view tracked with UTM params
            ↓
[... hours/days/weeks pass ...]
            ↓
Time X:     User starts checkout
Time X+10:  Your code calls getVisitorId()
Time X+50:  Checkout created with zori_visitor_id in metadata
            ↓
Time X+N:   Payment succeeds
Time X+N+1: Stripe sends webhook
Time X+N+2: Zori processes payment, links to visitor
Time X+N+3: Revenue attributed to original traffic source
```

## Security Considerations

- **visitor_id is not sensitive** - It's an anonymous identifier
- **No PII in tracking** - Unless you explicitly call identify()
- **Encryption at rest** - Stripe credentials are encrypted
- **Webhook validation** - Stripe signatures verified

## Next Steps

- [Revenue Attribution](/concepts/revenue-attribution/) - Deep dive into attribution
- [Stripe Integration](/integrations/stripe/) - Complete setup guide
- [Self-Hosting](/self-hosting/requirements/) - Control your data
