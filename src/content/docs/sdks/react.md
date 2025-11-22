---
title: React
description: React hooks and components for Zori Analytics
---

The `@zorihq/react` package provides React hooks and components for Zori Analytics.

## Installation

```bash
npm install @zorihq/react
# or
pnpm add @zorihq/react
# or
yarn add @zorihq/react
```

## Setup

Wrap your app with `ZoriProvider`:

```jsx
import { ZoriProvider } from '@zorihq/react';

function App() {
  return (
    <ZoriProvider
      config={{
        publishableKey: 'your-publishable-key',
        baseUrl: 'https://ingestion.zorihq.com/ingest', // optional
        comebackThreshold: 30000, // optional, default 30 seconds
        trackQuickSwitches: false, // optional, default false
      }}
      autoTrackPageViews={true}
    >
      <YourApp />
    </ZoriProvider>
  );
}
```

## Hooks

### useZori

Main hook for tracking events and identifying users:

```jsx
import { useZori } from '@zorihq/react';

function MyComponent() {
  const { track, identify, getVisitorId, setConsent, optOut } = useZori();

  const handlePurchase = async () => {
    await track('purchase_completed', {
      product_id: 'prod_123',
      amount: 99.99,
    });
  };

  const handleLogin = async () => {
    await identify({
      app_id: 'user_123',
      email: 'user@example.com',
      fullname: 'John Doe',
    });
  };

  return (
    <div>
      <button onClick={handlePurchase}>Complete Purchase</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### usePageView

Auto-track page views with custom properties:

```jsx
import { usePageView } from '@zorihq/react';

function ProductPage({ productId }) {
  usePageView({
    product_id: productId,
    page_type: 'product',
  });

  return <div>Product {productId}</div>;
}
```

### useIdentify

Auto-identify users when component mounts:

```jsx
import { useIdentify } from '@zorihq/react';

function UserProfile({ user }) {
  useIdentify(user ? {
    app_id: user.id,
    email: user.email,
    fullname: user.name,
    plan: user.subscription
  } : null);

  return <div>{user?.name}</div>;
}
```

### useTrackEvent

Track events with dependencies (re-tracks when deps change):

```jsx
import { useTrackEvent } from '@zorihq/react';

function SearchResults({ query, results }) {
  useTrackEvent(
    'search_completed',
    {
      query,
      result_count: results.length,
    },
    [query, results.length] // Re-track when these change
  );

  return <div>{results.length} results for "{query}"</div>;
}
```

## Components

### TrackClick

Automatically track clicks on any element:

```jsx
import { TrackClick } from '@zorihq/react';

function MyButton() {
  return (
    <TrackClick
      eventName="signup_clicked"
      properties={{ location: 'header' }}
      as="button"
      className="btn btn-primary"
    >
      Sign Up
    </TrackClick>
  );
}

// Works with any element
function MyLink() {
  return (
    <TrackClick
      eventName="cta_clicked"
      properties={{ cta: 'learn_more' }}
      as="a"
      href="/learn-more"
    >
      Learn More
    </TrackClick>
  );
}
```

## Getting Visitor ID for Stripe

The most important use case - get the visitor ID to pass to Stripe:

```jsx
import { useZori } from '@zorihq/react';

function CheckoutButton({ cartItems }) {
  const { getVisitorId } = useZori();

  const handleCheckout = async () => {
    // Get the visitor ID
    const visitorId = await getVisitorId();

    // Send to your backend
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        zori_visitor_id: visitorId, // Critical for revenue attribution!
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

## API Reference

### ZoriProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config.publishableKey` | `string` | Yes | Your Zori publishable key |
| `config.baseUrl` | `string` | No | Custom ingestion endpoint |
| `config.comebackThreshold` | `number` | No | Comeback event threshold (ms) |
| `config.trackQuickSwitches` | `boolean` | No | Track quick tab switches |
| `autoTrackPageViews` | `boolean` | No | Auto-track route changes |

### useZori Return Value

| Method | Description |
|--------|-------------|
| `track(eventName, properties)` | Track custom event |
| `identify(userInfo)` | Identify user |
| `getVisitorId()` | Get visitor ID (async) |
| `getSessionId()` | Get session ID |
| `setConsent(preferences)` | Set GDPR consent |
| `hasConsent()` | Check consent status |
| `optOut()` | Opt out completely |

## TypeScript Support

Full TypeScript support included:

```typescript
import type { ZoriConfig, UserInfo } from '@zorihq/react';

const config: ZoriConfig = {
  publishableKey: 'your-key',
  baseUrl: 'https://your-endpoint.com/ingest',
};

const user: UserInfo = {
  app_id: 'user_123',
  email: 'user@example.com',
  fullname: 'John Doe',
};
```

## Next Steps

- [Next.js Integration](/sdks/nextjs/) - Next.js specific setup
- [Revenue Attribution](/concepts/revenue-attribution/) - How to connect payments
- [Stripe Integration](/integrations/stripe/) - Complete payment setup
