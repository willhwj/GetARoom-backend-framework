const express = require('express');
const router = express.Router();
const { bootstrapField, createRoomTypeSlotForm} = require('../forms');
// import in checkIfAuthenticated middleware
const { checkIfAuthenticated} = require('../middleware');
// import in the models
const { Room_type_slot} = require('../models');

module.exports = router;