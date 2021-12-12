const express = require('express');
const router = express.Router();
const dataLayerShopping = require('../../dal/shopping');

router.get('/:customer_id', async(req, res)=> {
    let customerId = req.params.customer_id;
    res.send (await dataLayerShopping.getActiveCartByCustId(customerId));
})

module.exports = router;