# Builds the whole app (React client + Express server) into one image.
# Usually run through docker-compose.yml, which also starts MongoDB.

# 1. Build the React client
FROM node:22-alpine AS client
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 2. Server, which also serves the built client
FROM node:22-alpine

# Chromium and fonts for PDF generation; linked to one fixed path across Alpine versions
RUN apk add --no-cache chromium ttf-freefont ca-certificates udev \
    && ln -sf "$(command -v chromium-browser || command -v chromium)" /usr/local/bin/chrome

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    CHROME_BIN=/usr/local/bin/chrome

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
# Build tools are only needed if bcrypt has to compile; removed afterwards to keep the image small
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .build-deps
COPY server/ ./
COPY --from=client /app/client/dist /app/client/dist

RUN mkdir -p resources/uploads resources/logs && chown -R node:node resources
USER node

EXPOSE 3000
CMD ["node", "index.js"]
