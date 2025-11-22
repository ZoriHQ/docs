---
title: Manual Setup
description: Build and run Zori from source
---

This guide walks through building and running Zori from source code.

## Prerequisites

Install the required tools:

- **Go 1.24+**: [golang.org/dl](https://golang.org/dl/)
- **Task**: [taskfile.dev](https://taskfile.dev/installation/)
- **goose**: `go install github.com/pressly/goose/v3/cmd/goose@latest`

## Clone the Repository

```bash
git clone https://github.com/ZoriHQ/zori.git
cd zori
```

## Set Up Infrastructure

Start the required services. You can use Docker for these even when running the app manually:

```bash
# Start infrastructure services only
docker-compose -f run/tests/docker-compose.test.yaml up -d
```

Or install them natively:

- PostgreSQL 15+
- ClickHouse 24+
- Redis 7+
- NATS with JetStream enabled

## Configure Environment

```bash
# Copy the example environment file
cp example.env .env

# Edit with your settings
vim .env
```

Key settings for local development:

```bash
# Database
POSTGRES_URL=postgres://postgres:postgres@localhost:5434/postgres?sslmode=disable
CLICKHOUSE_URL=localhost:9000
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=default
CLICKHOUSE_DATABASE=default

# Message Queue & Cache
NATS_STREAM_URL=nats://localhost:4222
REDIS_ADDRS=localhost:6379

# Security (generate your own for production!)
JWT_SECRET_KEY=your-secret-key-min-32-characters-long
ENCRYPTION_KEY=your-encryption-key-must-be-32-chars!

# Mode
ZORI_IS_OSS=true
```

## Run Migrations

```bash
# Run all database migrations
task migrate:up
```

This runs migrations for both PostgreSQL and ClickHouse.

## Start the Servers

You need to run two servers:

### Terminal 1: API Server

```bash
task server
# Starts on port 1323
```

### Terminal 2: Ingestion Server

```bash
task ingestion
# Starts on port 1324
```

Or use the quick start command:

```bash
task start
# Runs migrations and starts the API server
```

## Available Task Commands

```bash
task --list
```

| Command | Description |
|---------|-------------|
| `task server` | Start the API server (port 1323) |
| `task ingestion` | Start the ingestion server (port 1324) |
| `task migrate:up` | Run all pending migrations |
| `task migrate:down` | Rollback the last migration |
| `task start` | Run migrations and start server |
| `task test` | Run the test suite |
| `task docs` | Generate Swagger documentation |

## Building for Production

```bash
# Build the binary
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o zori .

# Run the API server
./zori server

# Run the ingestion server
./zori ingestion
```

## Using the Dockerfile

The included Dockerfile builds a minimal production image:

```bash
# Build the image
docker build -f run/docker/Dockerfile -t zori:latest .

# Run the API server
docker run -p 1323:1323 --env-file .env zori:latest server

# Run the ingestion server
docker run -p 1324:1324 --env-file .env zori:latest ingestion
```

## Verifying the Setup

Test the API server:

```bash
curl http://localhost:1323/health
```

Test the ingestion endpoint:

```bash
curl http://localhost:1324/health
```

## Troubleshooting

### Migration Errors

If migrations fail, check your database connections:

```bash
# Test PostgreSQL
psql $POSTGRES_URL -c "SELECT 1"

# Test ClickHouse
curl "http://localhost:8123/?query=SELECT%201"
```

### Port Already in Use

Change the ports in your environment:

```bash
# In .env
TEST_SERVER_PORT=1325
```

### NATS Connection Issues

Ensure JetStream is enabled:

```bash
nats -s nats://localhost:4222 stream ls
```

## Next Steps

- [Environment Variables](/self-hosting/environment/) - Full configuration reference
- [Docker Setup](/self-hosting/docker/) - Containerized deployment
