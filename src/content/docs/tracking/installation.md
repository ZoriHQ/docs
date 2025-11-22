---
title: Installation
description: Add the Zori tracking script to your website
---

The Zori tracking script is a lightweight analytics tracker with comprehensive browser fingerprinting and automatic event tracking.

## Recommended: Async Loading with Event Queue

For optimal performance, initialize the queue before loading the script:

```html
<!-- Initialize queue first -->
<script>
  window.ZoriHQ = window.ZoriHQ || [];
</script>

<!-- Load script asynchronously -->
<script async src="https://cdn.zorihq.com/script.min.js"
        data-key="your-publishable-key"></script>

<!-- Track events immediately (even before script loads) -->
<script>
  window.ZoriHQ.push(['track', 'page_view']);
  window.ZoriHQ.push(['identify', {
    app_id: 'user_123',
    email: 'user@example.com'
  }]);
</script>
```

## Basic Installation

For simpler setups, just add the script tag:

```html
<script src="https://cdn.zorihq.com/script.min.js"
        data-key="your-publishable-key"></script>
```

## CDN URLs

| URL | Description |
|-----|-------------|
| `https://cdn.zorihq.com/script.min.js` | Latest stable version |
| `https://cdn.zorihq.com/v1.0.6/script.min.js` | Specific version (immutable) |
| `https://cdn.zorihq.com/latest/script.min.js` | Always latest |

We recommend pinning to a specific version in production for stability.

## Configuration Options

Customize behavior with data attributes:

```html
<script
  src="https://cdn.zorihq.com/script.min.js"
  data-key="your-publishable-key"
  data-base-url="https://your-custom-endpoint.com/ingest"
  data-comeback-threshold="30000"
  data-track-quick-switches="false">
</script>
```

### Available Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-key` | Required | Your publishable key from the dashboard |
| `data-base-url` | `https://ingestion.zorihq.com/ingest` | Custom ingestion endpoint (for self-hosted) |
| `data-comeback-threshold` | `30000` | Minimum hidden duration (ms) to trigger `user_comeback` event |
| `data-track-quick-switches` | `false` | Track all visibility changes, not just significant ones |

## Self-Hosted Configuration

When self-hosting Zori, point the script to your ingestion server:

```html
<script
  src="https://cdn.zorihq.com/script.min.js"
  data-key="your-publishable-key"
  data-base-url="https://your-domain.com:1324/ingest">
</script>
```

Or host the script yourself:

```html
<script
  src="https://your-domain.com/zori-script.min.js"
  data-key="your-publishable-key"
  data-base-url="https://your-domain.com:1324/ingest">
</script>
```

## Script Features

The tracking script includes:

- **Advanced Browser Fingerprinting** - Canvas, WebGL, Audio Context, hardware
- **Automatic Event Tracking** - Page views, clicks, visibility, unloads
- **Persistent Visitor ID** - Cookie-based, 2-year expiry
- **UTM Parameter Capture** - Automatic campaign attribution
- **Session Tracking** - 30-minute timeout, automatic management
- **Event Queue** - Track events before script loads
- **Heatmap Ready** - Click positions normalized by screen size
- **GDPR Compliant** - Consent management, DNT support, opt-out

## Size

- **Minified**: ~6.6KB
- **Gzipped**: ~2.5KB

## Browser Support

Works on all modern browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome for Android)

## Next Steps

- [JavaScript API](/tracking/javascript-api/) - Custom event tracking
- [Automatic Events](/tracking/automatic-events/) - What's tracked automatically
- [GDPR Compliance](/tracking/gdpr/) - Privacy and consent
