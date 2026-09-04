require('dotenv').config();
const mongoose = require('mongoose');
const Flight = require('../models/Flight');

const sampleFlights = [
  { airline: 'IndiGo', flightNumber: '6E-5054', fromCity: 'Indore', fromCode: 'IDR', toCity: 'Mumbai', toCode: 'BOM', departureTime: '05:40', arrivalTime: '06:55', duration: '01hr 15min', travelClass: 'Economy Class', price: 5000, seatsAvailable: 12 },
  { airline: 'Air India', flightNumber: 'AI-2031', fromCity: 'Indore', fromCode: 'IDR', toCity: 'Mumbai', toCode: 'BOM', departureTime: '09:10', arrivalTime: '10:30', duration: '01hr 20min', travelClass: 'Economy Class', price: 5600, seatsAvailable: 5 },
  { airline: 'Vistara', flightNumber: 'UK-945', fromCity: 'Indore', fromCode: 'IDR', toCity: 'Mumbai', toCode: 'BOM', departureTime: '14:25', arrivalTime: '15:45', duration: '01hr 20min', travelClass: 'Business Class', price: 6200, seatsAvailable: 8 },
  { airline: 'SpiceJet', flightNumber: 'SG-8157', fromCity: 'Delhi', fromCode: 'DEL', toCity: 'Bangalore', toCode: 'BLR', departureTime: '07:15', arrivalTime: '09:55', duration: '02hr 40min', travelClass: 'Economy Class', price: 4800, seatsAvailable: 20 },
  { airline: 'IndiGo', flightNumber: '6E-2109', fromCity: 'Delhi', fromCode: 'DEL', toCity: 'Bangalore', toCode: 'BLR', departureTime: '12:00', arrivalTime: '14:45', duration: '02hr 45min', travelClass: 'Economy Class', price: 5100, seatsAvailable: 15 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await Flight.deleteMany({});
    console.log('Old flights cleared');

    await Flight.insertMany(sampleFlights);
    console.log(`${sampleFlights.length} flights inserted`);

    await mongoose.disconnect();
    console.log('Done, disconnected');
  } catch (error) {
    console.log('Seeding error:', error.message);
    process.exit(1);
  }
}

seed();