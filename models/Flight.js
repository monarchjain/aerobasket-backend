const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    fromCity: { type: String, required: true },
    fromCode: { type: String, required: true },
    toCity: { type: String, required: true },
    toCode: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    travelClass: { type: String, required: true, default: 'Economy Class' },
    price: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true, default: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);