---
title: Svelte
description: Svelte stores, actions, and components for Zori Analytics
---

The `@zorihq/svelte` package provides Svelte stores, actions, and components for Zori Analytics.

## Installation

```bash
npm install @zorihq/svelte
# or
pnpm add @zorihq/svelte
# or
yarn add @zorihq/svelte
```

## Setup

### Option A: Global Store (Recommended)

Initialize once in your root component or layout:

```svelte
<!-- +layout.svelte or App.svelte -->
<script lang="ts">
  import { initZori } from '@zorihq/svelte';

  const zori = initZori({
    publishableKey: 'your-publishable-key',
    baseUrl: 'https://ingestion.zorihq.com/ingest', // optional
    comebackThreshold: 30000, // optional
    trackQuickSwitches: false, // optional
  });
</script>

<slot />
```

### Option B: Component Context

Use the `ZoriProvider` component:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { ZoriProvider } from '@zorihq/svelte';
</script>

<ZoriProvider config={{ publishableKey: 'your-key' }}>
  <slot />
</ZoriProvider>
```

## Tracking Events

```svelte
<script lang="ts">
  import { getZori } from '@zorihq/svelte';

  const zori = getZori();

  async function handlePurchase() {
    await zori.track('purchase_completed', {
      product_id: 'prod_123',
      amount: 99.99,
    });
  }

  async function handleLogin() {
    await zori.identify({
      app_id: 'user_123',
      email: 'user@example.com',
      fullname: 'John Doe',
    });
  }
</script>

<button on:click={handlePurchase}>Complete Purchase</button>
<button on:click={handleLogin}>Login</button>
```

## Actions

### trackClick

Automatically track clicks on any element:

```svelte
<script lang="ts">
  import { trackClick } from '@zorihq/svelte';
</script>

<button
  use:trackClick={{ eventName: 'signup_clicked', properties: { location: 'header' } }}
>
  Sign Up
</button>

<a
  href="/pricing"
  use:trackClick={{ eventName: 'cta_clicked', properties: { cta: 'pricing' } }}
>
  View Pricing
</a>
```

## Helpers

### usePageView

Auto-track page views on component mount:

```svelte
<script lang="ts">
  import { usePageView } from '@zorihq/svelte';

  export let productId: string;

  usePageView({
    page_type: 'product',
    product_id: productId,
  });
</script>

<div>Product {productId}</div>
```

### useTrackEvent

Track events on component mount:

```svelte
<script lang="ts">
  import { useTrackEvent } from '@zorihq/svelte';

  export let userId: string;

  useTrackEvent('profile_viewed', {
    user_id: userId,
  });
</script>

<div>User Profile</div>
```

### useIdentify

Identify users on component mount:

```svelte
<script lang="ts">
  import { useIdentify } from '@zorihq/svelte';

  export let user: any;

  useIdentify(
    user
      ? {
          app_id: user.id,
          email: user.email,
          fullname: user.name,
        }
      : null
  );
</script>

<div>{user?.name}</div>
```

## Reactive Tracking

```svelte
<script lang="ts">
  import { getZori } from '@zorihq/svelte';

  const zori = getZori();

  let searchQuery = '';
  let results = [];

  // Track when reactive values change
  $: if ($zori.isInitialized && searchQuery) {
    zori.track('search_performed', {
      query: searchQuery,
      result_count: results.length,
    });
  }
</script>

<input bind:value={searchQuery} placeholder="Search..." />
<div>{results.length} results</div>
```

## Check Initialization Status

```svelte
<script lang="ts">
  import { getZori } from '@zorihq/svelte';

  const zori = getZori();
</script>

{#if $zori.isInitialized}
  <p>Analytics Ready!</p>
{:else}
  <p>Loading analytics...</p>
{/if}
```

## SvelteKit Integration

### +layout.svelte

```svelte
<script lang="ts">
  import { initZori } from '@zorihq/svelte';
  import { page } from '$app/stores';

  const zori = initZori({
    publishableKey: import.meta.env.VITE_ZORI_KEY,
  });

  // Track page views on route change
  $: if ($zori.isInitialized && $page.url.pathname) {
    zori.track('page_view', {
      page_title: document.title,
      page_path: $page.url.pathname,
      page_search: $page.url.search,
    });
  }
</script>

<slot />
```

## Getting Visitor ID for Stripe

```svelte
<script lang="ts">
  import { getZori } from '@zorihq/svelte';

  const zori = getZori();

  async function handleCheckout(cartItems) {
    const visitorId = await zori.getVisitorId();

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
  }
</script>

<button on:click={() => handleCheckout(cart)}>Checkout</button>
```

## API Reference

### createZoriStore(config)

Create a new Zori store instance:

```ts
import { createZoriStore } from '@zorihq/svelte';

const zori = createZoriStore({
  publishableKey: 'your-key',
  baseUrl: 'https://ingestion.zorihq.com/ingest',
  comebackThreshold: 30000,
  trackQuickSwitches: false,
});
```

### initZori(config)

Initialize global Zori store (recommended for app-wide usage):

```ts
import { initZori } from '@zorihq/svelte';

const zori = initZori({ publishableKey: 'your-key' });
```

### getZori()

Get the global Zori store instance:

```ts
import { getZori } from '@zorihq/svelte';

const zori = getZori();
```

### ZoriStore Methods

| Method | Description |
|--------|-------------|
| `isInitialized` | Readable store indicating if ready |
| `track(eventName, properties)` | Track custom events |
| `identify(userInfo)` | Identify users |
| `getVisitorId()` | Get the visitor ID |
| `getSessionId()` | Get current session ID |
| `setConsent(preferences)` | Set GDPR consent |
| `optOut()` | Opt out completely |
| `hasConsent()` | Check consent status |

## Environment Variables

Create `.env`:

```bash
VITE_ZORI_KEY=your-publishable-key
```

## TypeScript Support

Full TypeScript support included:

```typescript
import type {
  ZoriConfig,
  ZoriStore,
  ConsentPreferences,
  UserInfo,
} from '@zorihq/svelte';
```

## Stores Pattern

This library follows Svelte's stores pattern:

- Use `$` to auto-subscribe in components
- Stores are reactive and update automatically
- Automatic cleanup on component destroy

## Next Steps

- [Revenue Attribution](/concepts/revenue-attribution/) - How payments connect to visitors
- [Stripe Integration](/integrations/stripe/) - Complete payment setup
- [GDPR Compliance](/tracking/gdpr/) - Privacy controls
