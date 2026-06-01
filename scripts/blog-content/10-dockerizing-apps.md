## Why "Just Add a Dockerfile" Goes Wrong

The first Dockerfile most developers write looks like this:

```dockerfile
FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

This works. It also produces a 1.8 GB image, includes your entire source history via `.git`, potentially bundles `.env` files with secrets, runs as root, and rebuilds all dependencies every time any file changes.

Let's do better.

## Multi-Stage Builds: The Core Pattern

Multi-stage builds separate the build environment (where you compile/install) from the runtime environment (where you run). The final image only contains what's needed to execute:

```dockerfile
# Stage 1: Build
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim AS runtime

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy only installed packages from builder — not the build tools
COPY --from=builder /root/.local /home/appuser/.local

COPY --chown=appuser:appuser src/ ./src/

ENV PATH="/home/appuser/.local/bin:$PATH"

USER appuser

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Result:** 280 MB image instead of 1.8 GB. No build tools in the runtime. Non-root user.

## Optimising for Build Cache

Docker layer caching means a layer only rebuilds if that layer or a layer above it changes. The most common mistake: copying all source code before installing dependencies.

```dockerfile
# Bad: invalidates pip install every time ANY source file changes
COPY . .
RUN pip install -r requirements.txt

# Good: pip install only reruns when requirements.txt changes
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
```

For a FastAPI app with 60 dependencies, this difference is 90 seconds vs. 3 seconds on most CI runners.

## Next.js Multi-Stage Build

Next.js adds complexity because `node_modules` is enormous and the build output is separate from the source:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
```

[!WARNING] This requires `output: 'standalone'` in your `next.config.js`. The standalone output includes a minimal Node.js server and all necessary files — the final image is typically 200–300 MB instead of 1.5+ GB.

## Secrets: What Never Goes in a Dockerfile

[!DANGER] Never use `ENV SECRET_KEY=...` or `ARG DB_PASSWORD=...` for secrets in a Dockerfile. These values are permanently stored in the image layer history and can be extracted with `docker history`.

**The right approaches:**

**Runtime environment variables** (for non-build-time secrets):
```bash
docker run -e DATABASE_URL="$DATABASE_URL" myapp:latest
```

**Docker secrets** (for sensitive files in Swarm/Compose):
```yaml
services:
  api:
    image: myapp:latest
    secrets:
      - db_password
secrets:
  db_password:
    external: true
```

**BuildKit secret mounts** (for build-time secrets, e.g., private PyPI):
```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=pip_token \
    pip install --index-url "https://$(cat /run/secrets/pip_token)@private.pypi.org/simple/" private-package
```

The secret is available only during that RUN step and is never written to any layer.

## .dockerignore Is Not Optional

```
.git
.github
node_modules
.next
__pycache__
*.pyc
.env*
*.env
.venv
venv
dist
build
.DS_Store
*.log
```

Without `.dockerignore`, `COPY . .` sends your entire git history, all node_modules, and any `.env` files to the Docker build context. For a typical Next.js project, this can mean sending 500 MB to the Docker daemon just to start the build.

The optimised Dockerfile reduces our FastAPI image from 1.8 GB to 280 MB, our Next.js image from 1.5 GB to 245 MB, and build time from 4 minutes to 45 seconds (with warm cache).
