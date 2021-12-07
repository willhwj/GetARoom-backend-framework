const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_SECRET
});

router.get('/sign', async(req, res)=> {
    // retrieve the paramters we need to send to cloudinary
    const params_to_sign = JSON.parse(req.query.params_to_sign);
    // retrieve our cloudinary api secret from the environment
    const apiSecret = process.env.CLOUDINARY_SECRET;
    // get the signature
    const signature = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);

    res.send(signature);
})

module.exports = router;