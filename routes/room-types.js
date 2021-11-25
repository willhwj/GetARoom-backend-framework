const express = require('express');
const router = express.Router();
// import in the forms
const { bootstrapField, createRoomTypeForm } = require('../forms');

// import in the Room_type model
const { Room_type} = require('../models');

// display room types
router.get('/', async(req, res) => {
    //  fetch all room types, i.e. SELECT * FROM room_types table
     let room_types = await Room_type.collection().fetch();
     res.render('room-types/index', {
         'room_types': room_types.toJSON()
     })
});

// create room types
router.get('/create', async (req, res)=> {
     const roomTypeForm = createRoomTypeForm();
     res.render('room-types/create', {
         'form': roomTypeForm.toHTML(bootstrapField)
     })
});

router.post('/create', async (req, res)=> {
    const roomTypeForm = createRoomTypeForm();
    roomTypeForm.handle(req, {
        'success': async (form)=> {
            const room_type = new Room_type();
            room_type.set('name', form.data.name);
            room_type.set('description', form.data.description);
            room_type.set('inventory', form.data.inventory);
            room_type.set('room_size', form.data.room_size);
            room_type.set('base_hourly_cost', form.data.base_hourly_cost);
            room_type.set('max_occupancy', form.data.max_occupancy);
            await room_type.save();
            res.redirect('/room-types');
        },
        'error': async (form)=> {
            res.render('room-types/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// update existing room types
router.get('/:room_type_id/update', async(req, res) => {
    const roomTypeId = req.params.room_type_id;
    const roomType = await Room_type.where({
        'id': roomTypeId
    }).fetch({
        require: true
    });

    const roomTypeForm = createRoomTypeForm();

    roomTypeForm.fields.name.value = roomType.get('name');
    roomTypeForm.fields.description.value = roomType.get('description');
    roomTypeForm.fields.inventory.value = roomType.get('inventory');
    roomTypeForm.fields.room_size.value = roomType.get('room_size');
    roomTypeForm.fields.base_hourly_cost.value = roomType.get('base_hourly_cost');
    roomTypeForm.fields.max_occupancy.value = roomType.get('max_occupancy');

    // console.log(roomTypeForm.fields.max_occupancy, roomTypeForm.fields.max_occupancy,);
    res.render('room-types/update', {
        'form': roomTypeForm.toHTML(bootstrapField),
        'roomType': roomType.toJSON()
    })
})

router.post('/:room_type_id/update', async(req, res)=> {
    const roomType = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true
    });

    const roomTypeForm = createRoomTypeForm();
    roomTypeForm.handle(req, {
        'success': async(form) => {
            roomType.set(form.data);
            roomType.save();
            res.redirect('/room-types');
        },
        'error': async(form)=> {
            res.render('room-types/update', {
                'form': form.toHTML(bootstrapField),
                'roomType': roomType.toJSON()
            })
        }
    })
})

// delete room type
router.get('/:room_type_id/delete', async (req, res) => {
    const roomType = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true
    });

    res.render('room-types/delete', {
        'roomType': roomType.toJSON()
    })
})

router.post('/:room_type_id/delete', async(req, res)=> {
    const roomType = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true
    });
    await roomType.destroy();
    res.redirect('/room-types');
})

module.exports = router;