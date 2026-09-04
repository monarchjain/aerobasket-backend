const express = require('express');
const router = express.Router();
const { searchFlights, getFlightById, getCities, createFlight } = require('../controllers/flightController');
const protect = require('../middleware/authMiddleware');

router.get('/search', searchFlights);
router.get('/cities', getCities);
router.post('/', protect, createFlight);
router.get('/:id', getFlightById);

module.exports = router;