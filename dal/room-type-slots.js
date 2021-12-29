const {Room_type_slot} = require('../models');

const getRoomTypeSlotById = async( roomTypeSlotId) => {
    return await Room_type_slot.where({
        'id': roomTypeSlotId
    }).fetch({
        require: false
    })
}

const adjustInv = async (change, roomTypeSlotId)=> {
    let roomTypeSlot = await getRoomTypeSlotById(roomTypeSlotId);
    let currentInv = roomTypeSlot.get('inventory');
    currentInv = currentInv - change;
    roomTypeSlot.set('inventory', currentInv);
    await roomTypeSlot.save();
}

module.exports = {getRoomTypeSlotById, adjustInv}