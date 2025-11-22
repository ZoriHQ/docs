---
title: JavaScript API
description: Track custom events and identify users with the Zori API
---

Once loaded, the script exposes a global `window.ZoriHQ` object for custom tracking.

## Track Custom Events

### Direct API (after script loads)

```javascript
window.ZoriHQ.track('button_clicked', {
  button_name: 'Sign Up',
  page: 'homepage'
});
```

### Queue Method (works before script loads)

```javascript
window.ZoriHQ.push(['track', 'purchase_completed', {
  product_id: 'prod_123',
  amount: 99.99
}]);
```

The queue method is especially useful when you need to track events immediately on page load, before the script has finished loading.

## Identify Users

Link visitor cookies to your application users. This is crucial for revenue attribution.

### Direct API

```javascript
window.ZoriHQ.identify({
  app_id: 'user_123',           // Your app's user ID (required)
  email: 'user@example.com',    // User email
  fullname: 'John Doe',         // Full name
  plan: 'premium',              // Custom properties
  signup_date: '2025-01-15'
});
```

### Queue Method

```javascript
window.ZoriHQ.push(['identify', {
  app_id: 'user_123',
  email: 'user@example.com',
  fullname: 'John Doe'
}]);
```

:::tip
Call `identify()` when users sign up or log in. This connects their anonymous visitor history to their user account.
:::

## Get Visitor ID

The visitor ID is essential for revenue attribution. Pass it to Stripe when creating checkouts.

### Async Method

```javascript
const visitorId = await window.ZoriHQ.getVisitorId();
console.log('Visitor ID:', visitorId);
```

### Queue Method with Callback

```javascript
window.ZoriHQ.push(['getVisitorId', function(id) {
  console.log('Visitor ID:', id);
}]);
```

## Get Session ID

```javascript
const sessionId = window.ZoriHQ.getSessionId();
```

Sessions automatically restart after:
- 30 minutes of inactivity
- Different UTM parameters (new campaign)
- Browser session ends

## Consent Management (GDPR)

### Set Consent Preferences

```javascript
window.ZoriHQ.setConsent({
  analytics: true,    // Allow analytics tracking
  marketing: false    // Deny marketing tracking
});
```

### Check Consent Status

```javascript
const hasConsent = window.ZoriHQ.hasConsent();
if (hasConsent) {
  // User has given consent
}
```

### Opt Out Completely

For GDPR right to be forgotten:

```javascript
window.ZoriHQ.optOut();
```

This deletes all cookies and localStorage data and blocks future tracking.

### Queue Methods for Consent

```javascript
// Set consent before script loads
window.ZoriHQ.push(['setConsent', { analytics: true }]);

// Or opt out
window.ZoriHQ.push(['optOut']);
```

## Complete Example

Here's a typical implementation:

```html
<!-- Initialize queue -->
<script>
  window.ZoriHQ = window.ZoriHQ || [];
</script>

<!-- Load script -->
<script async src="https://cdn.zorihq.com/script.min.js"
        data-key="your-publishable-key"></script>

<script>
  // Track page view immediately
  window.ZoriHQ.push(['track', 'page_view']);

  // When user logs in
  function onUserLogin(user) {
    window.ZoriHQ.push(['identify', {
      app_id: user.id,
      email: user.email,
      fullname: user.name
    }]);
  }

  // When starting checkout
  async function startCheckout(cartItems) {
    const visitorId = await window.ZoriHQ.getVisitorId();

    // Send to your backend
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems,
        zori_visitor_id: visitorId  // Critical for attribution!
      })
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  }

  // Track custom events
  document.querySelector('.signup-btn').addEventListener('click', () => {
    window.ZoriHQ.push(['track', 'signup_clicked', {
      location: 'hero_section'
    }]);
  });
</script>
```

## TypeScript Support

If you're using TypeScript, you can add type definitions:

```typescript
interface ZoriHQ {
  track(eventName: string, properties?: Record<string, any>): Promise<void>;
  identify(userInfo: {
    app_id: string;
    email?: string;
    fullname?: string;
    [key: string]: any;
  }): Promise<void>;
  getVisitorId(): Promise<string>;
  getSessionId(): string;
  setConsent(preferences: { analytics?: boolean; marketing?: boolean }): void;
  hasConsent(): boolean;
  optOut(): void;
  push(args: any[]): void;
}

declare global {
  interface Window {
    ZoriHQ: ZoriHQ | any[];
  }
}
```

## Next Steps

- [Automatic Events](/tracking/automatic-events/) - Events tracked automatically
- [GDPR Compliance](/tracking/gdpr/) - Full privacy documentation
- [Revenue Attribution](/concepts/revenue-attribution/) - Connecting payments to traffic
