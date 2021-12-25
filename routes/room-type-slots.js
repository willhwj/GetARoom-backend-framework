const express = require('express');
const router = express.Router();
const { bootstrapField, createRoomTypeSlotForm} = require('../forms');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');
// import in the models
const { Room_type_slot} = require('../models');

// display room type slots
router.get('/', checkIfAuthenticated, async(req, res)=> {
    let roomTypeSlots = await Room_type_slot.collection().fetch();
    res.render('room-type-slots/index', {
        'room_type_slots': roomTypeSlots.toJSON()
    })
})

module.exports = router;