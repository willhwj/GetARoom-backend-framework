const express = require('express');
const router = express.Router();
// import in the forms
const { bootstrapField, createRoomTypeForm } = require('../forms');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');

// import in the Room_type model
const { Room_type, Amenity } = require('../models');

// display room types
router.get('/', async (req, res) => {
    //  fetch all room types, i.e. SELECT * FROM room_types table
    let room_types = await Room_type.collection().fetch({
        withRelated: ['amenities']
    });
    res.render('room-types/index', {
        'room_types': room_types.toJSON()
    })
});

// create room types
router.get('/create', async (req, res) => {
    const allAmenities = await Amenity.fetchAll().map( amenity => [amenity.get('id'), amenity.get('name')]);
    const roomTypeForm = createRoomTypeForm(allAmenities);
    res.render('room-types/create', {
        'form': roomTypeForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
});

router.post('/create', async (req, res) => {
    const roomTypeForm = createRoomTypeForm();
    roomTypeForm.handle(req, {
        'success': async (form) => {
            let {amenities, ...roomTypeData} = form.data;
            const room_type = new Room_type(roomTypeData);
            // const room_type = new Room_type();
            // room_type.set('name', form.data.name);
            // room_type.set('description', form.data.description);
            // room_type.set('inventory', form.data.inventory);
            // room_type.set('room_size', form.data.room_size);
            // room_type.set('base_hourly_cost', form.data.base_hourly_cost);
            // room_type.set('max_occupancy', form.data.max_occupancy);
            await room_type.save();
            if (amenities) {
                await room_type.amenities().attach(amenities);
            };
            req.flash("success_messages", `New Room Type ${room_type.get('name')} has been created`);
            console.log('locals is ', res.locals.success_messages);
            res.redirect('/room-types');
        },
        'error': async (form) => {
            res.render('room-types/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// update existing room types
router.get('/:room_type_id/update', async (req, res) => {
    const roomTypeId = req.params.room_type_id;
    const room_type = await Room_type.where({
        'id': roomTypeId
    }).fetch({
        require: true,
        withRelated: ['amenities']
    });
    const allAmenities = await Amenity.fetchAll().map( amenity => [amenity.get('id'), amenity.get('name')]);
    const roomTypeForm = createRoomTypeForm(allAmenities);

    roomTypeForm.fields.name.value = room_type.get('name');
    roomTypeForm.fields.description.value = room_type.get('description');
    roomTypeForm.fields.inventory.value = room_type.get('inventory');
    roomTypeForm.fields.room_size.value = room_type.get('room_size');
    roomTypeForm.fields.base_hourly_cost.value = room_type.get('base_hourly_cost');
    roomTypeForm.fields.max_occupancy.value = room_type.get('max_occupancy');
    roomTypeForm.fields.image_url.value = room_type.get('image_url');

    let selectedAmenities = await room_type.related('amenities').pluck('id');
    roomTypeForm.fields.amenities.value = selectedAmenities;

    // console.log(roomTypeForm.fields.max_occupancy, roomTypeForm.fields.max_occupancy,);
    res.render('room-types/update', {
        'form': roomTypeForm.toHTML(bootstrapField),
        'roomType': room_type.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:room_type_id/update', async (req, res) => {
    const room_type = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true,
        withRelated: ['amenities']
    });

    const roomTypeForm = createRoomTypeForm();
    roomTypeForm.handle(req, {
        'success': async (form) => {
            let {amenities, ...roomTypeData} = form.data;
            room_type.set(roomTypeData);
            room_type.save();
            let existingAmenityIds = await room_type.related('amenities').pluck('id');
            let toRemove = existingAmenityIds.filter( id => amenities.includes(id) === false);
            console.log(toRemove, amenities);
            await room_type.amenities().detach(toRemove);
            await room_type.amenities().attach(amenities);
            res.redirect('/room-types');
        },
        'error': async (form) => {
            res.render('room-types/update', {
                'form': form.toHTML(bootstrapField),
                'roomType': room_type.toJSON()
            })
        }
    })
})

// delete room type
router.get('/:room_type_id/delete', checkIfAuthenticated, async (req, res) => {
    const room_type = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true
    });

    res.render('room-types/delete', {
        'roomType': room_type.toJSON()
    })
})

router.post('/:room_type_id/delete', checkIfAuthenticated, async (req, res) => {
    const room_type = await Room_type.where({
        'id': req.params.room_type_id
    }).fetch({
        require: true
    });
    await room_type.destroy();
    res.redirect('/room-types');
})

module.exports = router;