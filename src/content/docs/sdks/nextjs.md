---
title: Next.js
description: Next.js integration for Zori Analytics
---

The `@zorihq/nextjs` package provides Next.js-specific hooks and components with support for both App Router and Pages Router.

## Installation

```bash
npm install @zorihq/nextjs
# or
pnpm add @zorihq/nextjs
# or
yarn add @zorihq/nextjs
```

## App Router (Next.js 13+)

### 1. Create a Client Component Wrapper

Create `app/providers.tsx`:

```tsx
'use client';

import { ZoriProvider } from '@zorihq/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ZoriProvider
      config={{
        publishableKey: process.env.NEXT_PUBLIC_ZORI_KEY!,
        baseUrl: 'https://ingestion.zorihq.com/ingest', // optional
        comebackThreshold: 30000, // optional
        trackQuickSwitches: false, // optional
      }}
      autoTrackPageViews={true} // Auto-tracks route changes
    >
      {children}
    </ZoriProvider>
  );
}
```

### 2. Wrap Your Root Layout

Update `app/layout.tsx`:

```tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3. Use in Client Components

```tsx
'use client';

import { useZori } from '@zorihq/nextjs';

export default function MyPage() {
  const { track, identify } = useZori();

  const handlePurchase = async () => {
    await track('purchase_completed', {
      product_id: 'prod_123',
      amount: 99.99,
    });
  };

  return (
    <button onClick={handlePurchase}>
      Complete Purchase
    </button>
  );
}
```

## Pages Router (Next.js 12)

### Wrap Your App

Update `pages/_app.tsx`:

```tsx
import { ZoriProvider } from '@zorihq/nextjs';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ZoriProvider
      config={{
        publishableKey: process.env.NEXT_PUBLIC_ZORI_KEY!,
      }}
      autoTrackPageViews={true}
    >
      <Component {...pageProps} />
    </ZoriProvider>
  );
}
```

## Auto Route Tracking

The `ZoriProvider` automatically tracks route changes in both App Router and Pages Router when `autoTrackPageViews={true}` is set.

## Hooks

### useZori

```tsx
'use client';

import { useZori } from '@zorihq/nextjs';

function MyComponent() {
  const { track } = useZori();

  const handleClick = () => {
    track('button_clicked', { button_name: 'signup' });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

### useIdentify

```tsx
'use client';

import { useIdentify } from '@zorihq/nextjs';

function UserProfile({ user }) {
  useIdentify(user ? {
    app_id: user.id,
    email: user.email,
    fullname: user.name,
  } : null);

  return <div>{user?.name}</div>;
}
```

### usePageView

```tsx
'use client';

import { usePageView } from '@zorihq/nextjs';

function ProductPage({ productId }) {
  usePageView({
    product_id: productId,
    page_type: 'product',
  });

  return <div>Product {productId}</div>;
}
```

## Components

### TrackClick

```tsx
'use client';

import { TrackClick } from '@zorihq/nextjs';

function MyButton() {
  return (
    <TrackClick
      eventName="cta_clicked"
      properties={{ location: 'hero' }}
      as="button"
      className="btn"
    >
      Get Started
    </TrackClick>
  );
}
```

## Getting Visitor ID for Stripe

### Client-Side Checkout

```tsx
'use client';

import { useZori } from '@zorihq/nextjs';

function CheckoutButton({ cartItems }) {
  const { getVisitorId } = useZori();

  const handleCheckout = async () => {
    const visitorId = await getVisitorId();

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        zori_visitor_id: visitorId,
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

### API Route (App Router)

```ts
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { items, zori_visitor_id } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    metadata: {
      zori_visitor_id, // Critical for revenue attribution!
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
```

### API Route (Pages Router)

```ts
// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { items, zori_visitor_id } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    metadata: {
      zori_visitor_id,
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
  });

  res.json({ url: session.url });
}
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_ZORI_KEY=your-publishable-key
STRIPE_SECRET_KEY=sk_live_xxx
```

## Server Components

Since Zori tracking is client-side, you cannot use the hooks directly in Server Components. Instead:

1. Create a client component for tracking
2. Pass data from Server Components as props

```tsx
// app/product/[id]/page.tsx (Server Component)
import { ProductTracker } from './ProductTracker';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div>
      <ProductTracker productId={params.id} />
      <h1>{product.name}</h1>
    </div>
  );
}

// app/product/[id]/ProductTracker.tsx (Client Component)
'use client';

import { usePageView } from '@zorihq/nextjs';

export function ProductTracker({ productId }: { productId: string }) {
  usePageView({ product_id: productId, page_type: 'product' });
  return null;
}
```

## Next Steps

- [React SDK](/sdks/react/) - Core React documentation
- [Revenue Attribution](/concepts/revenue-attribution/) - How payments are attributed
- [Stripe Integration](/integrations/stripe/) - Complete Stripe setup
