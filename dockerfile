# Base stage
FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start-dev"]

# Production stage
FROM base AS production
RUN npm install --only-production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
