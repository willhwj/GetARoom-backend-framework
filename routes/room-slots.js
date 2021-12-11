const express = require('express');
const router = express.Router();
const { bootstrapField, createRoomSlotForm, updateRoomSlotForm, searchForm } = require('../forms');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');
// import in the models
const { Room_slot, Room, Room_type, Amenity } = require('../models');
// import in the DAL
const dataLayerSlots = require('../dal/room-slots');
const dataLayerAmenities = require('../dal/amenities');
const dataLayerRoomTypes = require('../dal/room-types');
const dataLayerRooms = require('../dal/rooms');

// display room slots
router.get('/', checkIfAuthenticated, async (req, res) => {
    // let room_slots = await Room_slot.collection().fetch();
    // res.render('room-slots/index', {
    //     'room_slots': room_slots.toJSON()
    // })

    const allAmenities = await dataLayerAmenities.getAllAmenities();
    allAmenities.unshift([0, '-----']);
    // let searchEngine = searchForm(allAmenities);
    let searchEngine = searchForm();
    let q = await dataLayerSlots.getAllSlots();

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
            console.log(form.data);
            if (form.data.room_type_name) {
                // q = q.where('room_type', 'like', '%' + req.query.room_type_name + '%')
                q = q.where('room_type', 'like', '%' + form.data.room_type_name + '%')
            }
            if (form.data.min_price) {
                q = q.where('price', '>=', req.query.min_price)
            }
            if (form.data.max_cost) {
                q = q.where('price', '<=', req.query.max_cost)
            }
            if (form.data.date) {
                // let date = new Date(form.data.date);
                q = q.where('date', '=', req.query.date)
            }
            if (form.data.starting_time) {
                let startSlot = form.data.date + ' ' + form.data.starting_time;
                console.log('startSlot: ', startSlot);
                let startTime = new Date(startSlot);
                console.log('startTime: ', startTime);
                q = q.where('timeslot', '>=', startTime)
            }
            if (form.data.ending_time) {
                let endSlot = form.data.date + ' ' + form.data.ending_time;
                console.log('endSlot: ', endSlot);
                let endTime = new Date(endSlot); 
                console.log('endTime: ', endTime);
                q = q.where('timeslot', '<=', endTime)
            }
            if (form.data.amenity) {
                // SQL statement:
                // SELECT * FROM room_slots
                // JOIN
                // rooms
                // ON room_slots.room_id = rooms.id
                // JOIN room_types
                // on rooms.room_type_id = room_types.id
                let arrayAmenities = form.data.amenity.map(eachAmenity => {
                    return parseInt(eachAmenity)
                });
                console.log(arrayAmenities);
                q = q.where('id', 'in', arrayAmenities)

                // q = q.query(
                //     'join', 'room_types', 'room_type', 'room_types.name', 
                //     )
            }

            let room_slots = await q.fetch({
                // withRelated: ['rooms.room_types.amenities']
            });
            res.render('room-slots/index', {
                'room_slots': room_slots.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// create room slots 
router.get('/create', checkIfAuthenticated, async (req, res) => {
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes();
    const allRooms = await dataLayerRooms.getAllRoomsArray();
    // create an array of 2-item arrays. 2-item array includes room type name and a nested array of room numbers of that room type
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
    const allRoomTypes = await dataLayerRoomTypes.getAllRoomTypes();
    const allRooms = await dataLayerRooms.getAllRoomsArray();
    // get an array of 2-item arrays. 2-item array includes room type name and an array of room id & room number
    const roomListByRoomType = allRoomTypes.map(roomType => {
        // populate associatedRooms when room type id match
        let associatedRooms = allRooms.filter(room => room[3] === roomType[0]);
        associatedRooms = associatedRooms.map(room => [room[0], room[2]]);
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
                    // use canada locale to have YYYY-MM-DD format
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
            const allRooms = await dataLayerRooms.getAllRoomsArray();
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
                        room_slot.set('room_type', relatedRoomType[4]);
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
    const room_slot = await dataLayerSlots.getSlotById(room_slot_id);

    const roomSlotForm = updateRoomSlotForm();
    roomSlotForm.fields.available.value = room_slot.get('available')==='1'? true: false;
    roomSlotForm.fields.price.value = room_slot.get('price');
    roomSlotForm.fields.price.readonly = true;
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
    const room_slot = await dataLayerSlots.getSlotById(room_slot_id);
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
    const room_slot = await dataLayerSlots.getSlotById(room_slot_id);
    res.render('room-slots/delete', {
        'room_slot': room_slot.toJSON()
    })
})

router.post('/:room_slot_id/delete', checkIfAuthenticated, async(req, res)=> {
    const room_slot_id = req.params.room_slot_id;
    const room_slot = await dataLayerSlots.getSlotById(room_slot_id);
    await room_slot.destroy();
    res.redirect('/room-slots');
})

module.exports = router;