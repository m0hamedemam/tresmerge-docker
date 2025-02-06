# Base stage
FROM node:18 as base
WORKDIR /app
COPY package.json package-lock.json ./

# Development stage
FROM base as development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start-dev"]

# Production stage
FROM base as production
RUN npm install --only-production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
