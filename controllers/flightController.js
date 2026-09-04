const Flight = require('../models/Flight');

exports.searchFlights = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from) filter.fromCity = { $regex: from, $options: 'i' };
    if (to) filter.toCity = { $regex: to, $options: 'i' };

    const flights = await Flight.find(filter);
    console.log(`Search: from="${from || 'any'}" to="${to || 'any'}" -> ${flights.length} results`);
    res.status(200).json({ flights });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json({ flight });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const fromCities = await Flight.distinct('fromCity');
    const toCities = await Flight.distinct('toCity');
    const cities = [...new Set([...fromCities, ...toCities])].sort();
    res.status(200).json({ cities });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const {
      airline, flightNumber, fromCity, fromCode, toCity, toCode,
      departureTime, arrivalTime, duration, travelClass, price, seatsAvailable
    } = req.body;

    if (!airline || !flightNumber || !fromCity || !fromCode || !toCity || !toCode || !departureTime || !arrivalTime || !duration || !price) {
      return res.status(400).json({ message: 'Missing required flight fields' });
    }

    const flight = await Flight.create({
      airline, flightNumber, fromCity, fromCode, toCity, toCode,
      departureTime, arrivalTime, duration,
      travelClass: travelClass || 'Economy Class',
      price,
      seatsAvailable: seatsAvailable || 20,
    });

    console.log(`Flight added: ${flight.airline} ${flight.flightNumber} (${flight.fromCity} -> ${flight.toCity})`);
    res.status(201).json({ message: 'Flight added successfully', flight });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};