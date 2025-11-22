---
title: Requirements
description: What you need to self-host Zori
---

Zori is designed to be self-hosted on your own infrastructure. Here's what you need.

## System Requirements

### Minimum (Development/Small Scale)

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Linux (Ubuntu 22.04+, Debian 11+), macOS, or Windows with WSL2

### Recommended (Production)

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD (scales with event volume)
- **OS**: Linux (Ubuntu 22.04+ recommended)

## Software Dependencies

### Required Services

| Service | Version | Purpose |
|---------|---------|---------|
| **PostgreSQL** | 15+ | User data, projects, payment providers |
| **ClickHouse** | 24+ | Event storage, analytics queries |
| **Redis** | 7+ | Caching, rate limiting |
| **NATS** | Latest | Message queue for event processing |

### For Building from Source

| Tool | Version | Notes |
|------|---------|-------|
| **Go** | 1.24+ | Backend compilation |
| **Task** | Latest | Task runner (like Make) |
| **goose** | Latest | Database migrations |

### For Docker Deployment

| Tool | Version |
|------|---------|
| **Docker** | 20.10+ |
| **Docker Compose** | 2.0+ |

## Network Requirements

### Ports

| Port | Service | Description |
|------|---------|-------------|
| 1323 | API Server | Main API endpoints |
| 1324 | Ingestion Server | Event ingestion endpoint |
| 5432 | PostgreSQL | Database (internal) |
| 9000 | ClickHouse | Native protocol (internal) |
| 8123 | ClickHouse | HTTP interface (internal) |
| 6379 | Redis | Cache (internal) |
| 4222 | NATS | Message queue (internal) |

### External Access

- **Ingestion endpoint** must be accessible from your users' browsers
- **API endpoint** for your dashboard
- **Webhook endpoint** for Stripe callbacks

## Architecture Overview

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

## Next Steps

- [Docker Setup](/self-hosting/docker/) - Quickest way to deploy
- [Manual Setup](/self-hosting/manual/) - Build from source
- [Environment Variables](/self-hosting/environment/) - Configuration reference
