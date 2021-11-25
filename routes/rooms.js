const express = require('express');
const router = express.Router();
const {bootstrapField, createRoomForm} = require('../forms');
const { Room, Room_type} = require('../models');

// display rooms
router.get('/', async(req, res) =>{
    let rooms = await Room.collection().fetch();
    res.render('rooms/index', {
        'rooms': rooms.toJSON()
    })
});

// create rooms
router.get('/create', async(req, res)=> {
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });

    console.log(allRoomTypes);

    const roomForm = createRoomForm(allRoomTypes);
    res.render('rooms/create', {
        'form': roomForm.toHTML(bootstrapField)
    })
});

router.post('/create', async (req, res)=> {
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    })
    
    const roomForm = createRoomForm(allRoomTypes);
    console.log(roomForm);
    roomForm.handle(req, {
        'success': async (form)=> {
            const room = new Room();
            room.set('room_number', form.data.room_number);
            room.set('room_price', form.data.room_price);
            room.set('room_type_id', form.data.room_type_id);
            await room.save();
            res.redirect('/rooms');
        },
        'error': async(form) => {
            res.render('rooms/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;