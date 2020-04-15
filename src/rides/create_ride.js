const validate = (req) => {
  const startLatitude = Number(req.body.start_lat);
  const startLongitude = Number(req.body.start_long);
  const endLatitude = Number(req.body.end_lat);
  const endLongitude = Number(req.body.end_long);
  const {
    body: {
      rider_name: riderName,
      driver_name: driverName,
      driver_vehicle: driverVehicle,
    },
  } = req;

  if (Math.abs(startLatitude) > 90 || Math.abs(startLongitude) > 180) {
    return ({
      error_code: 'VALIDATION_ERROR',
      message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    });
  }

  if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
    return ({
      error_code: 'VALIDATION_ERROR',
      message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    });
  }

  if (typeof riderName !== 'string' || riderName.length < 1) {
    return ({
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    });
  }

  if (typeof driverName !== 'string' || driverName.length < 1) {
    return ({
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    });
  }

  if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
    return ({
      error_code: 'VALIDATION_ERROR',
      message: 'Driver vehicle must be a non empty string',
    });
  }
  return null;
};

module.exports = (db) => (req, res) => {
  const validateErr = validate(req);
  if (validateErr) {
    return res.send(validateErr);
  }
  const {
    body: {
      rider_name: riderName,
      driver_name: driverName,
      driver_vehicle: driverVehicle,
      start_lat: startLat,
      start_long: startLong,
      end_lat: endLat,
      end_long: endLong,
    },
  } = req;
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
};
