const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Order, Cart_item } = require('../../models');
const dataLayerRoomTypeSlots = require('../../dal/room-type-slots');

// create webhook for Stripe to call and notify us of payment outcome
router.post('/process_payment', express.raw({ type: 'application/json' }),
    async (req, res) => {
        let payload = req.body;
        let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
        let sigHeader = req.headers['stripe-signature'];
        let event;
        try {
            event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        } catch (error) {
            res.send({
                'error': error.message
            })
        }
        if (event.type === 'checkout.session.completed') {
            const stripeSession = event.data.object;
            const listCartItems = JSON.parse(stripeSession.metadata.orders);
            const customer = JSON.parse(stripeSession.metadata.customer);
            const amountPaid = stripeSession.amount_total;

            // create new order
            const order = new Order();
            // shopping_cart table is not in use, hence using a dummy cart id for now
            order.set({
                'amount_paid': amountPaid,
                'create_time': new Date(),
                'status': 'paid',
                'customer_id': customer.id,
                'shopping_cart_id': '1'
            });
            await order.save();
            const orderId = order.get('id');
            // create new cart items, pegged to the order. decrement inventory of room type slots
            for (const item of listCartItems) {
                let {
                    product_id: roomTypeSlotId,
                    timeslot,
                    room_type_id: roomTypeId,
                    unit_price: unitPrice,
                    quantity,
                    room_type_name: roomTypeName
                } = item;
                const cartItem = new Cart_item();
                cartItem.set({
                    'price': unitPrice,
                    'timeslot': new Date(timeslot),
                    'quantity': quantity,
                    'status': 'paid',
                    'room_type_name': roomTypeName,
                    'order_id': orderId,
                    'room_type_slot_id': roomTypeSlotId,
                    'shopping_cart_id': '1'
                });
                await cartItem.save();
                // decrement inv by 1
                await dataLayerRoomTypeSlots.adjustInv(1, roomTypeSlotId);
            }
        }
        res.send({ received: true })
    }
)

module.exports = router;