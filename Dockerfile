# Official Playwright image: Node.js + browsers + system deps.
# The tag must match the @playwright/test version in package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Credentials are NOT baked into the image: they come from .env at runtime (see docker-compose.yml)
CMD ["npx", "playwright", "test"]
