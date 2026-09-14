const Flight = require('../models/Flight');
const { minutesBetween } = require('../utils/timeHelpers');

exports.searchFlights = async (req, res) => {
  try {
    const { from, to, travelClass } = req.query;

    const directFilter = {};
    if (from) directFilter.fromCity = { $regex: from, $options: 'i' };
    if (to) directFilter.toCity = { $regex: to, $options: 'i' };
    if (travelClass) directFilter.travelClass = { $regex: `^${travelClass}$`, $options: 'i' };

    const directFlights = await Flight.find(directFilter);

    // Build connecting itineraries (max one stop) when both endpoints are known
    let connections = [];
    if (from && to) {
      const firstLegFilter = { fromCity: { $regex: from, $options: 'i' } };
      if (travelClass) firstLegFilter.travelClass = { $regex: `^${travelClass}$`, $options: 'i' };
      const firstLegs = await Flight.find(firstLegFilter);

      for (const leg1 of firstLegs) {
        if (leg1.toCity.toLowerCase() === to.toLowerCase()) continue; // already a direct flight

        const secondLegFilter = {
          fromCity: leg1.toCity, // must exactly match where leg1 lands
          toCity: { $regex: to, $options: 'i' },
        };
        if (travelClass) secondLegFilter.travelClass = { $regex: `^${travelClass}$`, $options: 'i' };
        const secondLegs = await Flight.find(secondLegFilter);

        for (const leg2 of secondLegs) {
          const layoverMinutes = minutesBetween(leg1.arrivalTime, leg2.departureTime);
          // require a sane layover: at least 45 min, at most 12 hours
          if (layoverMinutes >= 45 && layoverMinutes <= 720) {
            connections.push({
              legs: [leg1, leg2],
              layoverMinutes,
              layoverCity: leg1.toCity,
              totalPrice: leg1.price + leg2.price,
            });
          }
        }
      }
    }

    console.log(`Search: from="${from || 'any'}" to="${to || 'any'}" -> ${directFlights.length} direct, ${connections.length} connecting`);

    res.status(200).json({ flights: directFlights, connections });
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

    res.status(201).json({ message: 'Flight added successfully', flight });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};