const express = require('express');
const router = express.Router();
// const dataLayerCustomers = require('../../dal/customers');
const { Customer } = require('../../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { checkIfAuthenticatedJWT } = require('../../middleware');
const dataLayerOrders = require('../../dal/orders');

// function to generate jwt token for correct credentials
const generateAccessToken = (customer) => {
    return jwt.sign({
        'id': customer.get('id'),
        'email': customer.get('email'),
        'firstName': customer.get('firstName'),
        'lastName': customer.get('lastName'),
        'phone': customer.get('phone_number'),
        'status': customer.get('status')
    }, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
    });
}

// log into customer account
router.post('/login', async (req, res) => {
    let email = req.body.email;
    let pw = req.body.password;
    let custAcct = await Customer.where({
        'email': email,
    }).fetch({
        require: false
    });
    if (custAcct && custAcct.get('password') === pw) {
        let accessToken = generateAccessToken(custAcct);
        res.send(accessToken);
    } else {
        res.status(404).send('the credentials do not match our record.')
    }

});

// display profile page
router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const cust = req.user;
    res.send(cust);
})

// create a new customer account
router.post('/create', async (req, res) => {
    let email = req.body.email;
    console.log(email);
    // check if the email is already registered
    let custAcct = await Customer.where({
        'email': email
    }).fetch({
        require: false
    });
    if (custAcct) {
        res.status(404).send('the email is already registered');
    } 
    // if not in use, create a new account
    else {
        const newAcct = new Customer({
            'firstName': req.body.firstName,
            'lastName': req.body.lastName,
            'email': req.body.email,
            'password': req.body.password,
            'phone_number': req.body.phone,
            'status': 'active'
        });
        await newAcct.save();
        console.log('new customer account is created successfully');
        let accessToken = generateAccessToken(newAcct);
        res.send(accessToken);
    }
});

// get order list by customer ID
router.get('/orders/:custId', async(req, res)=> {
    let custId = req.params.custId;
    let orderArray = await dataLayerOrders.getOrdersByCustId(custId);
    orderArray = orderArray.toJSON();
    res.send(orderArray);
})

module.exports = router;