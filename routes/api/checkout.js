const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// redirect to stripe for payment
router.post('/', async (req, res) => {
    const cart = req.body.cart;
    const customer = req.body.customer;
    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of cart) {
        const lineItem = {
            'name': item.room_type_name + item.timeslot,
            'amount': item.price,
            'quantity': item.quantity,
            'currency': 'SGD'
        }
        lineItems.push(lineItem);
        meta.push({
            'product_id': item.id,
            'quantity': item.quantity,
            'timeslot': item.timeslot,
            'room_type_id': item.room_type_id,
            'unit_price': item.price,
            'room_type_name': item.room_type_name
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    let customerData = JSON.stringify(customer);
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData,
            'customer': customerData
        }
    }
    // step 3 - register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment);
    res.send(stripeSession.url);
})

module.exports = router;