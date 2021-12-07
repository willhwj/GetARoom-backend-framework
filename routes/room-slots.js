const express = require('express');
const router = express.Router();
const { bootstrapField, createRoomSlotForm, updateRoomSlotForm, searchForm } = require('../forms');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');

const { Room_slot, Room, Room_type, Amenity } = require('../models');

// display room slots
router.get('/', checkIfAuthenticated, async (req, res) => {
    // let room_slots = await Room_slot.collection().fetch();
    // res.render('room-slots/index', {
    //     'room_slots': room_slots.toJSON()
    // })

    const allAmenities = await Amenity.fetchAll().map(amenity => [amenity.get('id'), amenity.get('name')]);
    allAmenities.unshift([0, '-----']);
    let searchEngine = searchForm(allAmenities);
    let q = await Room_slot.collection().fetch();

    searchEngine.handle(req, {
        'empty': async(form)=> {
            let room_slots = await q.fetch({
                // withRelated: ['amenity']
            });
            res.render('room-slots/index', {
                'room_slots': room_slots.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async(form)=> {
            let room_slots = await q.fetch();
            res.render('room-slots/index', {
                'room_slots': room_slots.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async(form)=> {
            if (form.data.room_type_name) {
                q = q.where('room_type', 'like', '%' + req.query.room_type_name + '%')
            }
            if (form.data.min_price) {
                q = q.where('price', '>=', req.query.min_price)
            }
            if (form.data.max_cost) {
                q = q.where('price', '<=', req.query.max_cost)
            }
            if (form.data.date) {
                q = q.where('date', '=', req.query.date)
            }
            if (form.data.starting_time) {
                q = q.where('timeslot', '>=', req.query.starting_time)
            }
            if (form.data.ending_time) {
                q = q.where('timeslot', '<=', req.query.ending_time)
            }
            if (form.data.amenity) {
                // SQL statement:
                // SELECT * FROM room_slots
                // JOIN
                // rooms
                // ON room_slots.room_id = rooms.id
                // JOIN room_types
                // on rooms.room_type_id = room_types.id
                q = q.query('join', 'room_types', 'room_type', 'room_types.name', 'join', 'amenities_room_types', 'room_types.id', 'room_type_id').where('amenity_id', 'in', form.data.amenity)
            }

            let room_slots = await q.fetch();
            res.render('room-slots/index', {
                'room_slots': room_slots.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// create room slots 
router.get('/create', checkIfAuthenticated, async (req, res) => {
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });
    const allRooms = await Room.fetchAll().map(room => {
        return [room.get('room_type_id'), room.get('id'), room.get('room_number')]
    });
    const roomListByRoomType = allRoomTypes.map(roomType => {
        let associatedRooms = allRooms.filter(room => room[0] === roomType[0]);
        associatedRooms = associatedRooms.map(room => [room[1], room[2]]);
        return [roomType[1], associatedRooms]
    });

    const roomSlotForm = createRoomSlotForm(roomListByRoomType);
    res.render('room-slots/create', {
        'form': roomSlotForm.toHTML(bootstrapField)
        // 'form': roomSlotForm.toHTML()
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {
    const allRoomTypes = await Room_type.fetchAll().map(roomType => {
        return [roomType.get('id'), roomType.get('name')];
    });
    const allRooms = await Room.fetchAll().map(room => {
        return [room.get('room_type_id'), room.get('id'), room.get('room_number')]
    });
    const roomListByRoomType = allRoomTypes.map(roomType => {
        let associatedRooms = allRooms.filter(room => room[0] === roomType[0]);
        associatedRooms = associatedRooms.map(room => [room[1], room[2]]);
        return [roomType[1], associatedRooms]
    });
    const roomSlotForm = createRoomSlotForm(roomListByRoomType);

    roomSlotForm.handle(req, {
        'success': async (form) => {
            let slotsPerDay = form.data.slots;
            let roomsPerSlot = form.data.room_id;
            // recursive function to get an array of dates for this slot creation task
            const addDay = (current, end) => {
                if (current === end) {
                    let days = [];
                    let date = new Date(current);
                    days.push(date.toLocaleDateString('en-CA'));
                    return days;
                } else {
                    days = addDay(current + 86400000, end);
                    date = new Date(current);
                    days.push(date.toLocaleDateString('en-CA'));
                    return days;
                }
            };
            let datesArray = addDay(Date.parse(form.data.start_date), Date.parse(form.data.end_date));
            
            // get an array of rooms and the room type name associated
            const allRooms = await Room.collection().fetch({
                withRelated: ['roomType']
            }).map(room => {
                return [room.get('id'), room.get('room_price'), room.get('room_type_id'), room.related('roomType').get('name')]
            });
            for (let eachDate of datesArray) {
                let date = new Date(eachDate);
                let dayOfWeek = date.getDay();
                for (let eachSlot of slotsPerDay) {
                    for (let eachRoom of roomsPerSlot) {
                        const room_slot = new Room_slot();
                        room_slot.set('available', form.data.available);
                        room_slot.set('day_of_week', dayOfWeek)
                        room_slot.set('date', eachDate);
                        room_slot.set('timeslot', eachDate + ' ' + eachSlot);
                        room_slot.set('room_id', eachRoom);
                        let relatedRoomType = allRooms.filter(room => room[0]=== parseInt(eachRoom))[0];
                        console.log(relatedRoomType);
                        room_slot.set('room_type', relatedRoomType[3]);
                        room_slot.set('price', relatedRoomType[1]);
                        await room_slot.save();
                    }
                }
            }
            res.redirect('/room-slots');
        },
        'error': async (form) => {
            res.render('room-slots/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// update room slot
router.get('/:room_slot_id/update', checkIfAuthenticated, async(req, res)=> {
    const room_slot_id = req.params.room_slot_id;
    const room_slot = await Room_slot.where({
        'id': room_slot_id
    }).fetch({
        require: true
    });

    const roomSlotForm = updateRoomSlotForm();
    roomSlotForm.fields.available.value = room_slot.get('available')==='1'? true: false;
    roomSlotForm.fields.price.value = room_slot.get('price');
    roomSlotForm.fields.price.readonly = true;
    // console.log(roomSlotForm.toHTML());
    roomSlotForm.fields.day_of_week.value = room_slot.get('day_of_week');
    // roomSlotForm.fields.date.value = room_slot.get('date');
    // roomSlotForm.fields.timeslot.value = room_slot.get('timeslot');
    // roomSlotForm.fields.room_id.value = room_slot.get('room_id');

    res.render('room-slots/update', {
        'form': roomSlotForm.toHTML(bootstrapField),
        'room_slot': room_slot.toJSON()
    })
})

router.post('/:room_slot_id/update', checkIfAuthenticated, async (req, res)=> {
    const room_slot_id = req.params.room_slot_id;
    const room_slot = await Room_slot.where({
        'id': room_slot_id
    }).fetch({
        require: true
    });
    const roomSlotForm = updateRoomSlotForm();
    roomSlotForm.handle(req, {
        'success': async(form) => {
            console.log(form.data);
            room_slot.set(form.data);
            room_slot.save();
            res.redirect('/room-slots');
        },
        'error': async(form)=> {
            res.render('room-slots/update', {
                'form': form.toHTML(bootstrapField),
                'room': room.toJSON()
            })
        }
    })
})

// delete slot
router.get('/:room_slot_id/delete', checkIfAuthenticated, async(req, res)=> {
    const room_slot_id = req.params.room_slot_id;
    const room_slot = await Room_slot.where({
        'id': room_slot_id
    }).fetch({
        require: true
    });
    res.render('room-slots/delete', {
        'room_slot': room_slot.toJSON()
    })
})

router.post('/:room_slot_id/delete', checkIfAuthenticated, async(req, res)=> {
    const room_slot_id = req.params.room_slot_id;
    const room_slot = await Room_slot.where({
        'id': room_slot_id
    }).fetch({
        require: true
    });
    await room_slot.destroy();
    res.redirect('/room-slots');
})

// search slots
router.get('/search', checkIfAuthenticated, async(req, res)=> {
    const allAmenities = await Amenity.fetchAll().map(amenity => [amenity.get('id'), amenity.get('name')]);
    allAmenities.unshift([0, '-----']);
    let searchEngine = searchForm(allAmenities);
    let q = Room_slot.collection();

    searchEngine.handle(req, {
        'empty': async(form)=> {
            let room_slots = await q.fetch({
                withRelated: ['amenity']
            });
            res.render('room-slots/index', {
                'room_slots': room_slots.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async(form)=> {

        },
        'success': async(form)=> {
            
        }
    })
})

module.exports = router;