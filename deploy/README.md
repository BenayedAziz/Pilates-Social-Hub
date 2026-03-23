# PilatesHub -- VPS Deployment Guide

## Prerequisites

- A VPS with Docker and Docker Compose installed
- A domain name pointed to your VPS IP (for HTTPS)
- SSH access to the VPS

## Quick Start

### 1. Clone the repo on your VPS

```bash
git clone <your-repo-url> pilateshub
cd pilateshub
```

### 2. Configure environment

```bash
cp deploy/.env.example .env
nano .env  # Set your domain and DB password
```

### 3. Build and start

Simple deployment (HTTP only, good for testing):

```bash
docker compose up -d --build
```

Production deployment with Caddy (automatic HTTPS via Let's Encrypt):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Verify

```bash
# Check all containers are running
docker compose ps

# Check logs
docker compose logs -f

# Test the app
curl http://localhost:3000
```

### 5. HTTPS (automatic with Caddy)

When using `docker-compose.prod.yml`, Caddy automatically provisions SSL
certificates from Let's Encrypt. Just make sure your domain's DNS A record
points to the VPS IP before starting.

## Architecture

```
Simple (docker-compose.yml):

  Internet --> Node.js API (port 3000)
                 |-- /api/*    --> Express routes
                 |-- /*        --> Static frontend SPA
                 └── Database  --> PostgreSQL (port 5432, internal)

Production (docker-compose.prod.yml):

  Internet --> Caddy (port 80/443, auto-HTTPS)
                 └── reverse_proxy --> Node.js API (port 3000)
                                        |-- /api/*    --> Express routes
                                        |-- /*        --> Static frontend SPA
                                        └── Database  --> PostgreSQL (port 5432, internal)
```

## Useful Commands

```bash
# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f caddy    # prod only

# Restart a single service
docker compose restart api

# Stop everything
docker compose down

# Stop and remove volumes (deletes database data!)
docker compose down -v

# Database shell
docker compose exec db psql -U pilateshub

# Run migrations (when available)
docker compose exec api node api/migrate.mjs
```

## Updating

```bash
cd pilateshub
git pull
docker compose up -d --build
```
