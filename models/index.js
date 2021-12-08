const bookshelf = require('../bookshelf');

const Room_type = bookshelf.model('Room_type', {
    tableName: 'room_types',
    rooms() {
        return this.hasMany('Room')
    },
    amenities(){
        return this.belongsToMany('Amenity');
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
    tableName: 'customers'
});

module.exports = { Room_type, Room, Room_slot, Amenity, User, Customer};