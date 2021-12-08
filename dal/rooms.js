const { Room, Room_type } = require('../models');

const getAllRoomTypes = async () => {
    return await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });
};

const getAllRooms = async ()=> {
    return await Room.collection().fetch();
}

const getRoomById = async (roomId) => {
    return await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
};

module.exports = { getAllRooms, getAllRoomTypes, getRoomById}