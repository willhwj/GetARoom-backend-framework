const bookshelf = require('../bookshelf');

const Room_type = bookshelf.model('Room_type', {
    tableName: 'room_types',
    rooms() {
        return this.hasMany('Room')
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
})

module.exports = { Room_type, Room, Room_slot};