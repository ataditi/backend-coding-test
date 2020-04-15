
const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const { buildSchemas, insertMockRides } = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);
      insertMockRides(db);
      return done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('Get /rides', () => {
    it('should get rides', (done) => {
      request(app)
        .get('/rides?prev=102')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((res) => {
          const reducer = (acc, elem) => (acc > elem.rideID ? elem.rideID : acc);
          const firstRideID = res.body.reduce(reducer, Number.MAX_SAFE_INTEGER);
          res.body = { length: res.body.length, firstRideID };
        })
        .expect(200, { length: 10, firstRideID: 103 }, done);
    });
    it('should get rides without prevID', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((res) => {
          const reducer = (acc, elem) => (acc > elem.rideID ? elem.rideID : acc);
          const firstRideID = res.body ? res.body.reduce(reducer, Number.MAX_SAFE_INTEGER) : -1;
          res.body = { length: res.body.length, firstRideID };
        })
        .expect(200, { length: 10, firstRideID: 1 }, done);
    });
    it('should return empty array for ID which  does not exist in DB', (done) => {
      request(app)
        .get('/rides?prev=102000')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        }, done);
    });
  });

  describe('Post /rides', () => {
    const mockBody = {
      start_lat: 10,
      start_long: 10,
      end_lat: 10,
      end_long: 10,
      rider_name: 'mockrider',
      driver_name: 'mockdriver',
      driver_vehicle: 'mockdriver',
    };
    it('should create a ride', (done) => {
      request(app)
        .post('/rides')
        .send(mockBody)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((res) => {
          delete res.body[0].created;
        })
        .expect(200, [{
          rideID: 1001,
          startLat: 10,
          startLong: 10,
          endLat: 10,
          endLong: 10,
          riderName: 'mockrider',
          driverName: 'mockdriver',
          driverVehicle: 'mockdriver',
        }], done);
    });
    it('should return validation error for invalid latitude', (done) => {
      request(app)
        .post('/rides')
        .send({ ...mockBody, start_lat: -200 })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        }, done);
    });
    it('should return validation error for invalid longitude', (done) => {
      request(app)
        .post('/rides')
        .send({ ...mockBody, end_long: -200 })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        }, done);
    });
    it('should return validation error for invalid rider name', (done) => {
      request(app)
        .post('/rides')
        .send({ ...mockBody, rider_name: null })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        }, done);
    });
    it('should return validation error for invalid driver name', (done) => {
      request(app)
        .post('/rides')
        .send({ ...mockBody, driver_name: null })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'VALIDATION_ERROR',
          message: 'Driver name must be a non empty string',
        }, done);
    });
    it('should return validation error for invalid driver vehicle', (done) => {
      request(app)
        .post('/rides')
        .send({ ...mockBody, driver_vehicle: null })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'VALIDATION_ERROR',
          message: 'Driver vehicle must be a non empty string',
        }, done);
    });
  });

  describe('Get /rides:id', () => {
    it('should get rides for given id', (done) => {
      request(app)
        .get('/rides/100')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((res) => {
          delete res.body[0].created;
        })
        .expect(200, [{
          rideID: 100,
          startLat: 10,
          startLong: 10,
          endLat: 10,
          endLong: 10,
          riderName: 'test-rider',
          driverName: 'test-driver',
          driverVehicle: 'test-vehicle',
        }], done);
    });

    it('should return empty array for invalid id', (done) => {
      request(app)
        .get('/rides/10000')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        }, done);
    });
  });
});
