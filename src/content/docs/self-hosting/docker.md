---
title: Docker Setup
description: Deploy Zori with Docker Compose
---

The fastest way to get Zori running is with Docker Compose.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ZoriHQ/zori.git
cd zori

# Copy environment file
cp example.env .env

# Start all services
docker-compose up -d
```

## Docker Compose Configuration

Create a `docker-compose.yaml` file:

```yaml
services:
  postgres:
    image: postgres:latest
    container_name: zori-postgres
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      timeout: 5s
      retries: 10
    volumes:
      - postgres-data:/var/lib/postgresql

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    container_name: zori-clickhouse
    environment:
      CLICKHOUSE_DB: default
      CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: 1
      CLICKHOUSE_PASSWORD: default
      CLICKHOUSE_USER: default
    ports:
      - "9000:9000"
      - "8123:8123"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "localhost:8123/ping"]
      interval: 2s
      timeout: 5s
      retries: 10
    volumes:
      - clickhouse-data:/var/lib/clickhouse

  nats:
    image: nats:alpine
    container_name: zori-nats
    command: ["-js", "-m", "8222"]
    ports:
      - "4222:4222"
      - "8222:8222"
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "4222"]
      interval: 2s
      timeout: 5s
      retries: 10

  redis:
    image: redis:latest
    container_name: zori-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      timeout: 5s
      retries: 10
    volumes:
      - redis-data:/data

  zori-api:
    build:
      context: .
      dockerfile: run/docker/Dockerfile
    container_name: zori-api
    command: ["server"]
    ports:
      - "1323:1323"
    environment:
      - POSTGRES_URL=postgres://postgres:postgres@postgres:5432/postgres?sslmode=disable
      - CLICKHOUSE_URL=clickhouse:9000
      - CLICKHOUSE_USERNAME=default
      - CLICKHOUSE_PASSWORD=default
      - CLICKHOUSE_DATABASE=default
      - NATS_STREAM_URL=nats://nats:4222
      - REDIS_ADDRS=redis:6379
      - ZORI_IS_OSS=true
    depends_on:
      postgres:
        condition: service_healthy
      clickhouse:
        condition: service_healthy
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy

  zori-ingestion:
    build:
      context: .
      dockerfile: run/docker/Dockerfile
    container_name: zori-ingestion
    command: ["ingestion"]
    ports:
      - "1324:1324"
    environment:
      - POSTGRES_URL=postgres://postgres:postgres@postgres:5432/postgres?sslmode=disable
      - CLICKHOUSE_URL=clickhouse:9000
      - CLICKHOUSE_USERNAME=default
      - CLICKHOUSE_PASSWORD=default
      - CLICKHOUSE_DATABASE=default
      - NATS_STREAM_URL=nats://nats:4222
      - REDIS_ADDRS=redis:6379
      - ZORI_IS_OSS=true
    depends_on:
      postgres:
        condition: service_healthy
      clickhouse:
        condition: service_healthy
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres-data:
  clickhouse-data:
  redis-data:

networks:
  default:
    name: zori-network
```

## Running Migrations

After the containers start, run database migrations:

```bash
# Enter the API container
docker exec -it zori-api sh

# Run migrations
task migrate:up
```

Or run migrations from your host if you have the tools installed:

```bash
# With task installed locally
task migrate:up
```

## Verifying the Installation

Check that all services are running:

```bash
docker-compose ps
```

Test the API:

```bash
curl http://localhost:1323/health
```

Test the ingestion endpoint:

```bash
curl http://localhost:1324/health
```

## Production Considerations

### Persistent Storage

The volumes in the compose file persist data. For production:

- Consider using managed databases (RDS, ClickHouse Cloud)
- Set up regular backups
- Use external volume mounts for easier backup/restore

### SSL/TLS

Put a reverse proxy (nginx, Caddy, Traefik) in front of Zori:

```yaml
  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
```

### Scaling

For high-volume deployments:

- Run multiple ingestion instances behind a load balancer
- Scale ClickHouse with sharding/replication
- Use Redis Cluster for caching

## Next Steps

- [Environment Variables](/self-hosting/environment/) - All configuration options
- [Manual Setup](/self-hosting/manual/) - Build from source
