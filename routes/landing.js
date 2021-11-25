const express = require('express');
const router = express.Router();

router.get('/', (req, res)=> {
    res.render('landing/index')
});

router.get('/today', (req, res)=> {
    res.render('landing/today-bookings')
});

// export out the router
module.exports = router;