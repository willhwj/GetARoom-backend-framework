const express = require('express');
const router = express.Router();
const { bootstrapField, createRoomSlotForm, updateRoomSlotForm } = require('../forms');
const { Room_slot, Room, Room_type } = require('../models');

// display room slots
router.get('/', async (req, res) => {
    let room_slots = await Room_slot.collection().fetch();
    res.render('room-slots/index', {
        'room_slots': room_slots.toJSON()
    })
})

// create room slots 
router.get('/create', async (req, res) => {
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

router.post('/create', async (req, res) => {
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
            console.log(form.data);
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
router.get('/:room_slot_id/update', async(req, res)=> {
    const slotId = req.params.room_slot_id;
    const roomSlot = await Room_slot.where({
        'id': slotId
    }).fetch({
        require: true
    });

    const roomSlotForm = updateRoomSlotForm();
    roomSlotForm.fields.available.value = roomSlot.get('available');
    roomSlotForm.fields.day_of_week.value = roomSlot.get('day_of_week');
    roomSlotForm.fields.date.value = roomSlot.get('date');
    roomSlotForm.fields.timeslot.value = roomSlot.get('timeslot');
    roomSlotForm.fields.room_id.value = roomSlot.get('room_id');

    res.render('room-slots/update', {
        'form': roomSlotForm.toHTML(bootstrapField),
        'roomSlot': roomSlot.toJSON()
    })
})

module.exports = router;