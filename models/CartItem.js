const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    travelDate: { type: String, default: '' },
    travelClass: { type: String, default: 'Economy Class' },
    travellers: { type: Number, default: 1 },
    price: { type: Number, required: true },
    legType: { type: String, enum: ['one_way', 'outbound', 'return', 'leg1', 'leg2'], default: 'one_way' },
    tripId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CartItem', cartItemSchema);