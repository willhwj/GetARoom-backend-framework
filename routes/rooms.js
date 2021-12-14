const express = require('express');
const router = express.Router();
const {bootstrapField, createRoomForm} = require('../forms');
const { Room, Room_type} = require('../models');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');
// import in the DAL
const dataLayerRooms = require('../dal/rooms');
const dataLayerRoomTypes = require('../dal/room-types');

// display rooms
router.get('/', checkIfAuthenticated, async(req, res) =>{
    let rooms = await dataLayerRooms.getAllRooms();
    res.render('rooms/index', {
        'rooms': rooms.toJSON()
    })
});

// create rooms
router.get('/create', checkIfAuthenticated, async(req, res)=> {
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes();
    const roomForm = createRoomForm(allRoomTypes);
    res.render('rooms/create', {
        'form': roomForm.toHTML(bootstrapField)
    })
});

router.post('/create', checkIfAuthenticated, async (req, res)=> {
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes(); 
    const roomForm = createRoomForm(allRoomTypes);
    roomForm.handle(req, {
        'success': async (form)=> {
            const room = new Room();
            room.set('room_number', form.data.room_number);
            room.set('room_price', form.data.room_price);
            room.set('room_type_id', form.data.room_type_id);
            await room.save();
            // increase inventory of room type by 1
            const roomType = await Room_type.where({
                'id': form.data.room_type_id
            }).fetch({
                require: true
            });
            let currentInv = roomType.get('inventory');
            currentInv ++;
            roomType.set('inventory', currentInv);
            await roomType.save();
            res.redirect('/rooms');
        },
        'error': async(form) => {
            res.render('rooms/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// update rooms
router.get('/:room_id/update', checkIfAuthenticated, async(req, res) => {
    const roomId = req.params.room_id;
    const room = await dataLayerRooms.getRoomById(roomId);
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes();
    const roomForm = createRoomForm(allRoomTypes);
    roomForm.fields.room_number.value = room.get('room_number');
    roomForm.fields.room_price.value = room.get('room_price');
    roomForm.fields.room_type_id.value = room.get('room_type_id');
    
    res.render('rooms/update', {
        'form': roomForm.toHTML(bootstrapField),
        'room': room.toJSON()
    })
})

router.post('/:room_id/update', checkIfAuthenticated, async(req, res) => {
    const roomId = req.params.room_id;
    const room = await dataLayerRooms.getRoomById(roomId);
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes();
    const roomForm = createRoomForm(allRoomTypes);
    roomForm.handle(req, {
        'success': async(form)=> {
            room.set(form.data);
            room.save();
            res.redirect('/rooms');
        },
        'error': async(form)=> {
            res.render('rooms/update',{
                'form': form.toHTML(bootstrapField),
                'room': room.toJSON()
            })
        }
    })
})

// delete a room
router.get('/:room_id/delete', checkIfAuthenticated, async (req, res) => {
    const roomId = req.params.room_id;
    const room = await dataLayerRooms.getRoomById(roomId);
    res.render('rooms/delete', {
        'room': room.toJSON()
    })
})

router.post('/:room_id/delete', checkIfAuthenticated, async (req, res) => {
    const roomId = req.params.room_id;
    const room = await dataLayerRooms.getRoomById(roomId);
    await room.destroy();
    res.redirect('/rooms');
})

module.exports = router;