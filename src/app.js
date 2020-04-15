
const express = require('express');
const winston = require('winston');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const pageSize = 100;

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/logfile.log' }),
  ],
});

module.exports = (db) => {
  app.get('/health', (req, res) => {
    logger.info('Health Check!!');
    res.send('Healthy');
  });

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const {
      body: {
        start_lat: startLat,
        start_long: startLong,
        end_lat: endLat,
        end_long: endLong,
        rider_name: riderName,
        driver_name: driverName,
        driver_vehicle: driverVehicle,
      },
    } = req;

    if (Math.abs(startLatitude) > 90 || Math.abs(startLongitude) > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      });
    }


    const values = [startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle];

    return db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function cb(err) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      return db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (findErr, rows) => {
        if (findErr) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }
        return res.send(rows);
      });
    });
  });

  app.get('/rides', (req, res) => {
    const prevID = req.query.prev || 0;
    const values = [prevID, pageSize];
    db.all('SELECT * FROM Rides where rideID > ? limit ?', values, (err, rows) => {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }
      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all('SELECT * FROM Rides WHERE rideID= ?', req.params.id, (err, rows) => {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  return app;
};
