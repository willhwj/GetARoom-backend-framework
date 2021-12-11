const { Room } = require('../models');

const getAllRooms = async () => {
    return await Room.collection().fetch();
}

// return an array of 3-item arrays. 3-item array includes room type ID, room ID and room number
// const getAllRoomsArray = async () => {
//     return await Room.fetchAll().map(room => {
//         return [room.get('room_type_id'), room.get('id'), room.get('room_number')]
//     })
// }
// get an array of rooms and the room type name associated
const getAllRoomsArray = async () => {
    return await Room.collection().fetch({
        withRelated: ['roomType']
    }).map(room => {
        return [room.get('id'), room.get('room_price'), room.get('room_number'), room.get('room_type_id'), room.related('roomType').get('name')]
    })
}

const getRoomById = async (roomId) => {
    return await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
};

module.exports = { getAllRooms, getRoomById, getAllRoomsArray }