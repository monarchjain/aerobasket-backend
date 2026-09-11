const CartItem = require('../models/CartItem');
const Flight = require('../models/Flight');

exports.getCart = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user.id }).populate('flightId');
    res.status(200).json({ cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { flightId, travelDate, travelClass, travellers, legType, tripId } = req.body;

    if (!flightId) {
      return res.status(400).json({ message: 'flightId is required' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const travellerCount = travellers || 1;

    const cartItem = await CartItem.create({
      userId: req.user.id,
      flightId,
      travelDate: travelDate || '',
      travelClass: travelClass || flight.travelClass,
      travellers: travellerCount,
      price: flight.price * travellerCount, // total for this leg, not per-passenger
      legType: legType || 'one_way',
      tripId: tripId || null,
    });

    const populatedItem = await cartItem.populate('flightId');

    console.log(`Added to cart: ${flight.airline} ${flight.flightNumber} x${travellerCount} for user ${req.user.id}`);

    res.status(201).json({ message: 'Added to cart', cartItem: populatedItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to remove this item' });
    }

    await cartItem.deleteOne();

    console.log(`Removed cart item ${req.params.id} for user ${req.user.id}`);

    res.status(200).json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};