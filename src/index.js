require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Client } = require('pg');
const redis = require('redis');

// Init app
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

redisClient.on('error', (err) => console.log('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis...'));

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// PostgreSQL connection


const pgClient = new Client({
  user: process.env.DB_USER || 'root',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'testDB',
  password: process.env.DB_PASSWORD || 'example',
  port: process.env.DB_PORT || 5432,
});

pgClient
  .connect()
  .then(() => console.log('Connected to the PostgreSQL database...'))
  .catch((err) => console.error('Failed to connect to the PostgreSQL database:', err));

// MongoDB connection
const mongoURL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`;

mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the MongoDB database...'))
  .catch((err) => console.error('Failed to connect to the MongoDB database:', err));

// Define a route
app.get('/', async (req, res) => {
  try {
    await redisClient.set('products', 'products...');
    console.log('Redis key "products" set successfully');
    res.send('<h1>Hello Tresmerge FROM AWS</h1>');
  } catch (err) {
    console.error('Redis set error:', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

app.get('/data', async (req, res) => {
  try {
    const products = await redisClient.get('products');
    console.log('Redis key "products" value:', products);
    if (products) {
      res.send(`<h1>Hello Tresmerge FROM AWS </h1> <h2>${products}</h2>`);
    } else {
      res.send('<h1>Hello Tresmerge FROM AWS </h1> <h2>No products found</h2>');
    }
  } catch (err) {
    console.error('Redis get error:', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await redisClient.quit();
    console.log('Redis connection closed.');
  } catch (err) {
    console.error('Error closing Redis connection:', err);
  }
  try {
    await pgClient.end();
    console.log('PostgreSQL connection closed.');
  } catch (err) {
    console.error('Error closing PostgreSQL connection:', err);
  }
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
  process.exit(0);
});

// Start the server
app.listen(PORT, () => console.log(`App is up and running on port: ${PORT}`));