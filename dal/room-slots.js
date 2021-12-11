const { Room_slot } = require('../models');


const getAllSlots = async()=> {
    return await Room_slot.collection().fetch();
};

const getSlotById = async( slotId) => {
    return await Room_slot.where({
        'id': slotId
    }).fetch({
        require: true
    })
}

module.exports = {getAllSlots, getSlotById}