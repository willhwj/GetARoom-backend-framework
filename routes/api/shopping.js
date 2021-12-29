const express = require('express');
const router = express.Router();
// const dataLayerShopping = require('../../dal/shopping');

const { Cart_item, Shopping_cart, Room_type_slot } = require('../../models');

// get available room type slots
router.post('/', async(req, res)=> {
    let roomTypeSlots = await Room_type_slot.collection().fetch();
    // add search criteria per user input
    if (req.body.roomTypeId && req.body.roomTypeId!=='') {
        roomTypeSlots = roomTypeSlots.where({'room_type_id': req.body.roomTypeId});
    }
    if (req.body.date) {
        let date = new Date(req.body.date);
        let nextDate = new Date(date.setDate(date.getDate() + 1));
        roomTypeSlots = roomTypeSlots.where('timeslot', '>=', new Date(req.body.date)).where('timeslot', '<=', nextDate);
    }
    if (req.body.startSlot){
        let startSlot = req.body.date + ' ' + req.body.startSlot;
        let startTime = new Date(startSlot);
        roomTypeSlots = roomTypeSlots.where('timeslot', '>=', startTime);
    }
    if (req.body.endSlot){
        let endSlot = req.body.date + ' ' + req.body.endSlot;
        let endTime = new Date(endSlot);
        roomTypeSlots = roomTypeSlots.where('timeslot', '<=', endTime);
    }
    if (req.body.numRooms) {
        roomTypeSlots = roomTypeSlots.where('inventory', '>=', req.body.inventory);
    }
    let filtered = await roomTypeSlots.fetch();
    res.send(filtered);
})

// get active cart by customer ID
router.get('/:customer_id', async(req, res)=> {
    let customerId = req.params.customer_id;
    let cart = await Shopping_cart.collection().where({
        'customer_id': customerId,
        'transaction_status': 'active'
    }).fetch({
        require: false,
        withRelated: ['cartItems', 'cartItems.roomTypeSlot']
    })
    res.send(cart);
})

// create an active cart with customer ID with 1st cart item
router.post('/create', async(req, res)=> {
    // create cart
    console.log('enter create cart route');
    let currentTime = new Date();
    let customerId = req.body.customerId;
    let quantity = req.body.quantity;
    // cart expires after 1 day, if there is no modification or checkout
    let expiryTime = new Date(currentTime.getMilliseconds() + 86400000);
    let cart = new Shopping_cart({
        'customer_id': customerId,
        'create_time': currentTime,
        // 3 statuses: active, inactive, paid
        'transaction_status': 'active',
        'payment_status': false,
        'cart_expiry': expiryTime,
        'last_modified_time': currentTime,
        'quantity_total': quantity
    });
    await cart.save();

    // create cart item
    let cartId = cart.get('id');
    let roomTypeSlotId = req.body.roomTypeSlotId;
    let roomTypeSlot = await Room_type_slot.where({
        'id': roomTypeSlotId
    }).fetch({
        require: false
    });
    let roomTypeName = roomTypeSlot.get('room_type_name');
    let unitPrice = roomTypeSlot.get('price');
    let price = unitPrice * quantity;
    let timeslot = roomTypeSlot.get('timeslot');
    let cartItem = new Cart_item({
        'shopping_cart_id': cartId,
        // 4 statuses: active, inactive, paid, fulfilled
        'status': 'active',
        'quantity': quantity,
        'room_type_name': roomTypeName,
        'timeslot': timeslot,
        'price': price,
        'room_type_slot_id': roomTypeSlotId
    });
    await cartItem.save();
    res.send(cartItem);
})

// update cart items to existing cart
router.post('/update', async (req, res) => {
    // scenario 1: same cart item, only update the quantity

    // scenario 2: a new item is added

    // scenario 3: an existing item is removed

    // scenario 4: all items are removed. cart abandoned

})

// get orders by customer ID and status
router.get('/order/:customerId', async(req, res)=> {

})

module.exports = router;