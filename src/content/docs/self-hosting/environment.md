---
title: Environment Variables
description: Complete configuration reference for Zori
---

All configuration is done through environment variables. Copy `example.env` to `.env` and customize.

## Database Configuration

### PostgreSQL

```bash
# Connection URL (required)
POSTGRES_URL=postgres://user:password@localhost:5432/zori?sslmode=disable
```

### ClickHouse

```bash
# Connection details (required)
CLICKHOUSE_URL=localhost:9000
CLICKHOUSE_USERNAME=default
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=default
CLICKHOUSE_DATABASE=default
```

## Message Queue & Cache

### NATS

```bash
# NATS JetStream URL (required)
NATS_STREAM_URL=nats://localhost:4222

# Optional: NATS credentials for cloud/secured deployments
NATS_CREDENTIALS_CONTENT=
```

### Redis

```bash
# Redis address (required)
REDIS_ADDRS=localhost:6379

# Optional: Redis password
REDIS_PASSWORD=
```

## Security

```bash
# JWT configuration (required)
JWT_SECRET_KEY=your-secret-key-must-be-at-least-32-characters-long
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=168h

# Encryption key for sensitive data (required, must be 32 characters)
ENCRYPTION_KEY=your-encryption-key-must-be-32-chars!

# BCrypt cost for password hashing
BCRYPT_COST=10
```

:::caution
Generate strong, random keys for production. Never use the example values.
:::

## Server Configuration

```bash
# API server host
ZORI_API_HOST=http://localhost:1323

# Test server settings
TEST_SERVER_PORT=1324
TEST_SERVER_HOST=localhost

# Timeouts
TEST_TIMEOUT=30s
TEST_DB_TIMEOUT=5s
```

## Application Mode

```bash
# OSS mode: single-tenant, self-hosted
# Set to true for self-hosted deployments
ZORI_IS_OSS=true

# Debug mode for ORM queries (0=off, 1=on)
BUNDEBUG=0
```

### OSS vs Cloud Mode

| Setting | OSS Mode | Cloud Mode |
|---------|----------|------------|
| `ZORI_IS_OSS` | `true` | `false` |
| Auth | Your own implementation | Clerk integration |
| Stripe | Direct API key | Stripe App OAuth |
| Tenancy | Single tenant | Multi-tenant |

## Feature Flags

```bash
# Email verification (requires email service setup)
FEATURE_EMAIL_VERIFICATION=false

# Password recovery (requires email service setup)
FEATURE_PASSWORD_RECOVERY=false

# Rate limiting
FEATURE_RATE_LIMITING=true
```

## Observability

```bash
# Master switch for telemetry
TELEMETRY_ENABLED=false

# Datadog integration
DATADOG_ENABLED=false

# OpenTelemetry
OTEL_ENABLED=false

# Log level: debug, info, warn, error
LOG_LEVEL=info
```

## Stripe Configuration (Cloud Mode)

These are only needed for Zori Cloud (multi-tenant) deployments:

```bash
# Stripe App credentials
ZORI_STRIPE_APP=false
ZORI_STRIPE_APP_SECRET_KEY=
ZORI_STRIPE_APP_WEBHOOK_SECRET=
```

## Complete Example

Here's a complete production `.env` file:

```bash
# Database
POSTGRES_URL=postgres://zori:secretpassword@db.example.com:5432/zori?sslmode=require
CLICKHOUSE_URL=clickhouse.example.com:9000
CLICKHOUSE_USERNAME=zori
CLICKHOUSE_PASSWORD=secretpassword
CLICKHOUSE_DATABASE=zori

# Message Queue
NATS_STREAM_URL=nats://nats.example.com:4222
REDIS_ADDRS=redis.example.com:6379
REDIS_PASSWORD=redispassword

# Security (use generated values!)
JWT_SECRET_KEY=generate-a-random-64-character-string-here
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=168h
ENCRYPTION_KEY=generate-random-32-char-string!!

# Server
ZORI_API_HOST=https://api.yourdomain.com
ZORI_IS_OSS=true

# Features
FEATURE_RATE_LIMITING=true

# Observability
TELEMETRY_ENABLED=true
LOG_LEVEL=info
```

## Generating Secure Keys

```bash
# Generate a random 64-character string
openssl rand -hex 32

# Generate a 32-character encryption key
openssl rand -base64 24
```

## Next Steps

- [Docker Setup](/self-hosting/docker/) - Containerized deployment
- [Manual Setup](/self-hosting/manual/) - Build from source
