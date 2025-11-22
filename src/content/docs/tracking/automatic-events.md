---
title: Automatic Events
description: Events tracked automatically by the Zori script
---

The Zori tracking script automatically captures key events without any additional code.

## Page Views

**Event: `page_view`**

Tracked on initial page load with:

- Page title
- Page path
- Search parameters
- Hash fragment

```json
{
  "event_name": "page_view",
  "page_title": "Pricing - Acme Inc",
  "page_path": "/pricing",
  "page_search": "?plan=pro",
  "page_hash": "#features"
}
```

## Click Tracking

**Event: `click`**

Every click is tracked with enhanced element detection:

```json
{
  "event_name": "click",
  "element_type": "button",
  "element_selector": ".cta-button",
  "element_text": "Get Started",
  "link_href": null,
  "click_x": 450,
  "click_y": 320,
  "screen_width": 1920,
  "screen_height": 1080
}
```

### Click Properties

| Property | Description |
|----------|-------------|
| `element_type` | `button`, `link`, `input`, or `clickable` |
| `element_selector` | Optimized CSS selector (not 10 levels deep) |
| `element_text` | Text content of the element |
| `link_href` | Destination URL for links |
| `click_x`, `click_y` | Click coordinates |
| `screen_width`, `screen_height` | For heatmap normalization |
| `data_attributes` | Any `data-*` attributes on the element |

## Session Events

### Session Start

**Event: `session_start`**

Triggered when a new session begins.

### Session End

**Event: `session_end`**

Triggered when a session expires, includes:

- `duration_ms` - Session duration in milliseconds
- `page_count` - Number of pages viewed

```json
{
  "event_name": "session_end",
  "duration_ms": 542000,
  "page_count": 7
}
```

### Session Restart Triggers

Sessions automatically restart when:

1. **30 minutes of inactivity** pass
2. **New UTM parameters** are detected (new campaign)
3. **Browser session ends** (tab/window closed)

## Visibility Events

### User Comeback

**Event: `user_comeback`**

Triggered when a user returns after being away for a significant time (>30 seconds by default).

```json
{
  "event_name": "user_comeback",
  "hidden_duration_ms": 45000,
  "hidden_duration_seconds": 45
}
```

This helps identify users who were away vs. quick tab switches.

### Left While Hidden

**Event: `left_while_hidden`**

Triggered when a user closes/navigates away while the page was in a background tab.

```json
{
  "event_name": "left_while_hidden",
  "hidden_duration_ms": 120000,
  "hidden_duration_seconds": 120
}
```

Helps distinguish between active exits and background tab closures.

### Configuring Visibility Tracking

```html
<script
  src="https://cdn.zorihq.com/script.min.js"
  data-key="your-key"
  data-comeback-threshold="30000"
  data-track-quick-switches="false">
</script>
```

| Option | Default | Description |
|--------|---------|-------------|
| `data-comeback-threshold` | `30000` | Minimum hidden duration (ms) to trigger `user_comeback` |
| `data-track-quick-switches` | `false` | Set to `true` to track all visibility changes |

## Common Event Properties

All events include these base properties:

| Property | Description |
|----------|-------------|
| `visitor_id` | Unique visitor identifier (persists 2 years) |
| `session_id` | Current session identifier |
| `utm_source` | Campaign source (if present) |
| `utm_medium` | Campaign medium |
| `utm_campaign` | Campaign name |
| `utm_term` | Campaign term |
| `utm_content` | Campaign content |
| `referrer` | HTTP referrer |
| `user_agent` | Browser user agent |
| `page_url` | Full page URL |
| `host` | Page hostname |
| `timestamp` | Event timestamp (UTC) |

## Browser Fingerprinting

On first visit, Zori generates a comprehensive fingerprint for visitor identification:

- Screen resolution, color depth, orientation
- Browser properties (user agent, platform, languages, timezone)
- Hardware info (CPU cores, memory, touch points)
- Canvas and WebGL fingerprints
- Audio context fingerprint
- Available media devices
- Network connection info
- Battery status (if available)

The fingerprint is stored in localStorage and helps identify returning visitors even if cookies are cleared.

## Data Storage

### Cookies

| Cookie | Purpose | Expiry |
|--------|---------|--------|
| `zori_visitor_id` | Anonymous visitor tracking | 2 years |
| `zori_session_id` | Session tracking | Browser close |
| `zori_consent` | Consent preferences | 2 years |

### localStorage

- Browser fingerprint
- Session data
- Identified user info

## Next Steps

- [JavaScript API](/tracking/javascript-api/) - Custom event tracking
- [GDPR Compliance](/tracking/gdpr/) - Privacy and consent management
- [How It Works](/concepts/how-it-works/) - Understanding the tracking system
