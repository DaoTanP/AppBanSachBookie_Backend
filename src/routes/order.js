const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const OrderModel = require('../models/order');
const BookModel = require('../models/book');
const { getUserByUsername } = require('../middlewares/userService');
const { verifyToken } = require('../middlewares/authService');

router.use(verifyToken);
router.use(getUserByUsername);

router.get('/', async (req, res) => {
    const productIds = req.user.cart;
    let totalPrice = 0;
    let quantity = 0;


    if (!productIds || productIds.constructor !== Array || productIds.length === 0)
        res.status(400).json({ message: 'error processing product' });

    try {
        await Promise.all(productIds.map(async id => {
            const product = await BookModel.findById(id);
            totalPrice += product.price;
            quantity++;
        }));

        const order = new OrderModel({
            productId: productIds,
            quantity: quantity,
            total: totalPrice,
            createdAt: Date.now(),
            status: 'pending'
        });
        const newOrder = await order.save();
        const user = req.user;
        user.order.push(newOrder._id);
        user.save();
        res.json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/cancelOrder', async (req, res) => {
    const orderId = req.body.orderId;

    if (!orderId)
        res.status(404).json({ message: 'please provide valid order id' });

    try {
        const order = await OrderModel.findById(orderId);
        order.status = 'cancelled';
        order.save();
        res.status(200);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;