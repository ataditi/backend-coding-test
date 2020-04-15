const defaultPageSize = 10;

module.exports = (db) => (req, res) => {
  const prevID = req.query.prev || 0;
  const pageSize = req.query.pageSize || defaultPageSize;
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
};
