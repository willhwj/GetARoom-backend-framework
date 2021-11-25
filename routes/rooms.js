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

// update rooms
router.get('/:room_id/update', async(req, res) => {
    const roomId = req.params.room_id;
    const room = await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });
    const roomForm = createRoomForm(allRoomTypes);
    roomForm.fields.room_number.value = room.get('room_number');
    roomForm.fields.room_price.value = room.get('room_price');
    roomForm.fields.room_type_id.value = room.get('room_type_id');
    
    res.render('rooms/update', {
        'form': roomForm.toHTML(bootstrapField),
        'room': room.toJSON()
    })
})

router.post('/:room_id/update', async(req, res) => {
    const roomId = req.params.room_id;
    const room = await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')]
    });
    const roomForm = createRoomForm(allRoomTypes);
    roomForm.handle(req, {
        'success': async(form)=> {
            room.set(form.data);
            room.save();
            res.redirect('/rooms');
        },
        'error': async(form)=> {
            res.render('rooms/updates',{
                'form': form.toHTML(bootstrapField),
                'room': room.toJSON()
            })
        }
    })
})

// delete a room
router.get('/:room_id/delete', async (req, res) => {
    const roomId = req.params.room_id;
    const room = await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
    res.render('rooms/delete', {
        'room': room.toJSON()
    })
})

router.post('/:room_id/delete', async (req, res) => {
    const roomId = req.params.room_id;
    const room = await Room.where({
        'id': roomId
    }).fetch({
        require: true
    });
    await room.destroy();
    res.redirect('/rooms');
})

module.exports = router;