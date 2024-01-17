const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: {
        type: [String],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    status: {
        type: String
    }
});

const model = mongoose.model('Order', orderSchema, 'orders');
module.exports = model;