
module.exports.buildSchemas = (db) => {
  const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

  db.run(createRideTableSchema);

  return db;
};

module.exports.insertMockRides = (db) => {
  for (let i = 0; i < 1000; i += 1) {
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', [10, 10, 10, 10, 'test-rider', 'test-driver', 'test-vehicle']);
  }
};
