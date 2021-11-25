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
    }
})

module.exports = { Room_type, Room};