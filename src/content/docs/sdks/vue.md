---
title: Vue
description: Vue 3 composables and plugin for Zori Analytics
---

The `@zorihq/vue` package provides Vue 3 composables and a plugin for Zori Analytics.

## Installation

```bash
npm install @zorihq/vue
# or
pnpm add @zorihq/vue
# or
yarn add @zorihq/vue
```

## Setup

### Install the Plugin

```ts
// main.ts
import { createApp } from 'vue';
import { ZoriPlugin } from '@zorihq/vue';
import App from './App.vue';
import router from './router'; // Optional: for auto-tracking

const app = createApp(App);

app.use(ZoriPlugin, {
  config: {
    publishableKey: 'your-publishable-key',
    baseUrl: 'https://ingestion.zorihq.com/ingest', // optional
    comebackThreshold: 30000, // optional
    trackQuickSwitches: false, // optional
  },
  router, // Optional: pass Vue Router for auto page view tracking
  autoTrackPageViews: true, // Optional: default true
});

app.use(router);
app.mount('#app');
```

## Composables

### useZori

Main composable for tracking:

```vue
<script setup lang="ts">
import { useZori } from '@zorihq/vue';

const { track, identify, getVisitorId, setConsent } = useZori();

async function handlePurchase() {
  await track('purchase_completed', {
    product_id: 'prod_123',
    amount: 99.99,
  });
}

async function handleLogin() {
  await identify({
    app_id: 'user_123',
    email: 'user@example.com',
    fullname: 'John Doe',
  });
}
</script>

<template>
  <div>
    <button @click="handlePurchase">Complete Purchase</button>
    <button @click="handleLogin">Login</button>
  </div>
</template>
```

### usePageView

Auto-track page views:

```vue
<script setup lang="ts">
import { usePageView } from '@zorihq/vue';

const props = defineProps<{ productId: string }>();

// Track page view with static properties
usePageView({
  page_type: 'product',
  product_id: props.productId,
});
</script>

<template>
  <div>Product {{ productId }}</div>
</template>
```

### useIdentify

Auto-identify users reactively:

```vue
<script setup lang="ts">
import { useIdentify } from '@zorihq/vue';
import { computed } from 'vue';

const props = defineProps<{ user: any }>();

// Identify user reactively
const userInfo = computed(() =>
  props.user
    ? {
        app_id: props.user.id,
        email: props.user.email,
        fullname: props.user.name,
      }
    : null
);

useIdentify(userInfo);
</script>

<template>
  <div>{{ user?.name }}</div>
</template>
```

### useTrackEvent

Track events with reactivity:

```vue
<script setup lang="ts">
import { useTrackEvent } from '@zorihq/vue';
import { ref } from 'vue';

const query = ref('');
const results = ref([]);

// Re-track when reactive values change
useTrackEvent('search_completed', {
  query: query.value,
  result_count: results.value.length,
});
</script>

<template>
  <div>
    <input v-model="query" placeholder="Search..." />
    <div>{{ results.length }} results for "{{ query }}"</div>
  </div>
</template>
```

## Template Usage

Track events directly in templates:

```vue
<script setup lang="ts">
import { useZori } from '@zorihq/vue';

const { track } = useZori();

function trackClick(eventName: string, properties: Record<string, any>) {
  track(eventName, properties);
}
</script>

<template>
  <button @click="trackClick('signup_clicked', { location: 'header' })">
    Sign Up
  </button>
</template>
```

## Vue Router Integration

When you pass the Vue Router instance to the plugin, it automatically tracks page views on route changes:

```ts
app.use(ZoriPlugin, {
  config: { publishableKey: 'your-key' },
  router, // Auto-tracks page views
  autoTrackPageViews: true, // Enable/disable auto-tracking
});
```

## Getting Visitor ID for Stripe

```vue
<script setup lang="ts">
import { useZori } from '@zorihq/vue';

const { getVisitorId } = useZori();

async function handleCheckout(cartItems: any[]) {
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
}
</script>

<template>
  <button @click="handleCheckout(cart)">Checkout</button>
</template>
```

## Nuxt 3 Integration

### Create a Plugin

Create `plugins/zori.client.ts`:

```ts
import { ZoriPlugin } from '@zorihq/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  nuxtApp.vueApp.use(ZoriPlugin, {
    config: {
      publishableKey: useRuntimeConfig().public.zoriKey,
    },
    router,
    autoTrackPageViews: true,
  });
});
```

### Configure Runtime Config

In `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      zoriKey: process.env.NUXT_PUBLIC_ZORI_KEY,
    },
  },
});
```

## API Reference

### ZoriPlugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `config.publishableKey` | `string` | Yes | Your Zori publishable key |
| `config.baseUrl` | `string` | No | Custom ingestion endpoint |
| `config.comebackThreshold` | `number` | No | Comeback event threshold |
| `config.trackQuickSwitches` | `boolean` | No | Track quick tab switches |
| `router` | `Router` | No | Vue Router for auto-tracking |
| `autoTrackPageViews` | `boolean` | No | Auto-track page views |

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

Full TypeScript support:

```typescript
import type {
  ZoriConfig,
  UserInfo,
  ConsentPreferences,
} from '@zorihq/vue';
```

## Environment Variables

```bash
# .env
VITE_ZORI_KEY=your-publishable-key
```

Access in code:

```ts
import.meta.env.VITE_ZORI_KEY
```

## Next Steps

- [Revenue Attribution](/concepts/revenue-attribution/) - How payments connect to visitors
- [Stripe Integration](/integrations/stripe/) - Complete payment setup
- [GDPR Compliance](/tracking/gdpr/) - Privacy controls
