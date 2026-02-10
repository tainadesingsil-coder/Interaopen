FROM node:20-slim

WORKDIR /app

# better-sqlite3 may compile native addons.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 8787

CMD ["npm", "start"]
