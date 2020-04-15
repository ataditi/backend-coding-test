module.exports = (db) => (req, res) => {
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
};
