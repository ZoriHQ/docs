---
title: GDPR Compliance
description: Privacy controls, consent management, and data handling
---

Zori is built with privacy in mind. This guide covers GDPR compliance features.

## Consent Management

### Setting Consent

Allow users to control their tracking preferences:

```javascript
// Before tracking starts (recommended)
window.ZoriHQ.push(['setConsent', {
  analytics: true,   // Essential analytics
  marketing: false   // Optional marketing
}]);

// Or after script loads
window.ZoriHQ.setConsent({
  analytics: true,
  marketing: false
});
```

### Checking Consent

```javascript
const hasConsent = window.ZoriHQ.hasConsent();

if (hasConsent) {
  // User has consented to tracking
}
```

### Consent UI Example

```html
<div id="cookie-banner" style="display: none;">
  <p>We use cookies to understand how you use our site.</p>
  <button onclick="acceptAll()">Accept All</button>
  <button onclick="acceptEssential()">Essential Only</button>
  <button onclick="rejectAll()">Reject All</button>
</div>

<script>
  // Check if user has already set preferences
  if (!window.ZoriHQ.hasConsent()) {
    document.getElementById('cookie-banner').style.display = 'block';
  }

  function acceptAll() {
    window.ZoriHQ.setConsent({ analytics: true, marketing: true });
    document.getElementById('cookie-banner').style.display = 'none';
  }

  function acceptEssential() {
    window.ZoriHQ.setConsent({ analytics: true, marketing: false });
    document.getElementById('cookie-banner').style.display = 'none';
  }

  function rejectAll() {
    window.ZoriHQ.optOut();
    document.getElementById('cookie-banner').style.display = 'none';
  }
</script>
```

## Do Not Track (DNT)

The script automatically respects the browser's Do Not Track header. If DNT is enabled, no tracking occurs.

```javascript
// DNT is checked automatically
// No additional code needed
```

Users can enable DNT in their browser settings:
- Chrome: Settings > Privacy and security > Send a "Do Not Track" request
- Firefox: Settings > Privacy & Security > Send websites a "Do Not Track" signal
- Safari: Enabled by default with Intelligent Tracking Prevention

## Right to Be Forgotten

Users can completely opt out and delete all their data:

```javascript
window.ZoriHQ.optOut();
```

This action:

1. **Deletes all cookies** - `zori_visitor_id`, `zori_session_id`, `zori_consent`
2. **Clears localStorage** - Fingerprint, session data, identified user info
3. **Blocks future tracking** - No new data will be collected

### Providing an Opt-Out Link

```html
<a href="#" onclick="window.ZoriHQ.optOut(); alert('You have been opted out.');">
  Opt out of tracking
</a>
```

## Data Collected

### Cookies

| Cookie | Purpose | Expiry | Required |
|--------|---------|--------|----------|
| `zori_visitor_id` | Anonymous visitor tracking | 2 years | Yes (with consent) |
| `zori_session_id` | Session tracking | Browser close | Yes (with consent) |
| `zori_consent` | Consent preferences | 2 years | Always |

### localStorage Data

- Browser fingerprint (for visitor identification)
- Session data (duration, page count)
- Identified user info (if `identify()` was called)

### Server-Side Data

- Events with timestamps
- Page URLs
- User agents
- IP addresses (for geolocation, then discarded)
- UTM parameters
- Referrer information

## Self-Hosting for Data Control

For maximum data control, self-host Zori:

```html
<script
  src="https://cdn.zorihq.com/script.min.js"
  data-key="your-key"
  data-base-url="https://your-server.com:1324/ingest">
</script>
```

Benefits:
- **Data stays on your infrastructure**
- **No third-party data sharing**
- **Full audit trail**
- **Custom retention policies**

## Data Retention

When self-hosting, you control data retention. Example ClickHouse retention policy:

```sql
-- Delete events older than 2 years
ALTER TABLE events DELETE WHERE created_at < now() - INTERVAL 2 YEAR;
```

## Implementing a Privacy Policy

Your privacy policy should include:

1. **What data is collected** - Visitor ID, session data, page views, clicks
2. **Why it's collected** - Revenue attribution, analytics
3. **How long it's stored** - Your retention period
4. **Who has access** - Your team, no third parties (if self-hosting)
5. **User rights** - Opt-out, data deletion

### Sample Privacy Policy Section

> **Analytics**
>
> We use Zori, a self-hosted analytics solution, to understand how visitors use our website and to attribute revenue to marketing channels.
>
> We collect:
> - Anonymous visitor identifiers
> - Pages visited
> - Clicks and interactions
> - Referral sources and UTM parameters
>
> This data is stored on our own servers and is not shared with third parties. You can opt out of tracking at any time using the link in our footer.

## GDPR Compliance Checklist

- [ ] Obtain consent before tracking (use consent management)
- [ ] Respect Do Not Track browser settings (automatic)
- [ ] Provide opt-out mechanism (`optOut()`)
- [ ] Document data collection in privacy policy
- [ ] Set appropriate data retention periods
- [ ] Self-host for maximum control (recommended)

## Next Steps

- [Self-Hosting](/self-hosting/requirements/) - Control your data completely
- [JavaScript API](/tracking/javascript-api/) - Consent API reference
- [How It Works](/concepts/how-it-works/) - Understanding what's tracked
