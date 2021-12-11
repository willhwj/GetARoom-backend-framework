const { Room_type} = require ('../models');

const getAllRoomTypes = async()=> {
    return await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });
};

module.exports = {getAllRoomTypes}