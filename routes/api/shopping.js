const express = require('express');
const router = express.Router();
// const dataLayerShopping = require('../../dal/shopping');

const { Cart_item, Shopping_cart, Room_type_slot } = require('../../models');

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

// create an active cart with customer ID
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


async function createCartItem(cartId, roomTypeSlotId, quantity) {
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
        'price': price
    });
    await cartItem.save();
    return cartItem;
}

async function addToCart(customerId, roomTypeSlotId, quantity) {
    let cart = await getActiveCartByCustId(customerId);
    // if there is no cart/ cart is empty, create cart and add 1st item to cart
    // if (!cart) {
    //     cart = await createCart(customerId, quantity);
    //     let cartId = cart.get('id');
    //     return await createCartItem(cartId, roomTypeSlotId, quantity);
    // } else if(cart.related('cartItems.roomTypeSlot'))

    // if there is a cart with item and the same item is added, update the quantity of the cart item


    // if there is a cart with item and different item is added, add item to the cart

}

module.exports = router;