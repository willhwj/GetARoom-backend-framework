const bookshelf = require('../bookshelf');

const Room_type = bookshelf.model('Room_type', {
    tableName: 'room_types',
    rooms() {
        return this.hasMany('Room')
    },
    amenities(){
        return this.belongsToMany('Amenity');
    },
    roomTypeSlots(){
        return this.hasMany('Room_type_slot')
    }
});

const Room = bookshelf.model('Room', {
    tableName: 'rooms',
    roomType() {
        return this.belongsTo('Room_type')
    },
    roomSlots (){
        return this.hasMany('Room_slot')
    }
});

const Room_slot = bookshelf.model('Room_slot', {
    tableName: 'room_slots',
    room() {
        return this.belongsTo('Room')
    },
    roomTypeSlot() {
        return this.belongsTo('Room_type_slot')
    }
});

const Amenity = bookshelf.model('Amenity', {
    tableName: 'amenities',
    roomTypes(){
        return this.belongsToMany('Room_type')
    }
});

const User = bookshelf.model('User', {
    tableName: 'users'
});

const Customer = bookshelf.model('Customer', {
    tableName: 'customers',
    shoppingCarts(){
        return this.hasMany('Shopping_cart')
    },
    orders(){
        return this.hasMany('Order')
    }
});

const Room_type_slot = bookshelf.model('Room_type_slot', {
    tableName: 'room_type_slots',
    roomType(){
        return this.belongsTo('Room_types')
    },
    roomSlots(){
        return this.hasMany('Room_slot')
    }
});

const Shopping_cart = bookshelf.model('Shopping_cart', {
    tableName: 'shopping_carts',
    cartItems(){
        return this.hasMany('Cart_item')
    },
    customer(){
        return this.belongsTo('Customer')
    }
});

const Order = bookshelf.model('Order', {
    tableName: 'orders',
    cartItems(){
        return this.hasMany('Cart_item')
    },
    customer(){
        return this.belongsTo('Customer')
    }
});

const Cart_item = bookshelf.model('Cart_item', {
    tableName: 'cart_items',
    order(){
        return this.belongsTo('Order')
    },
    shoppingCart(){
        return this.belongsTo('Shopping_cart')
    },
    roomTypeSlot(){
        return this.belongsTo('Room_type_slot')
    }
})

module.exports = { Room_type, Room, Room_slot, Amenity, User, Customer, Room_type_slot, Shopping_cart, Order, Cart_item};