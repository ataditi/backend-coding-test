
const express = require('express');
const winston = require('winston');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const getRides = require('./rides/get_rides');
const createRide = require('./rides/create_ride');
const getRideByID = require('./rides/get_ride_by_id');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/logfile.log' }),
  ],
});

module.exports = (db) => {
  app.get('/health', (_, res) => {
    logger.info('Health Check!!');
    res.send('Healthy');
  });

  app.post('/rides', jsonParser, createRide(db));
  app.get('/rides', getRides(db));
  app.get('/rides/:id', getRideByID(db));

  return app;
};
