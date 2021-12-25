const express = require('express');
const router = express.Router();
// const dataLayerCustomers = require('../../dal/customers');
const { Customer } = require('../../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { checkIfAuthenticatedJWT } = require('../../middleware');

// function to generate jwt token for correct credentials
const generateAccessToken = (user)=> {
    return jwt.sign({
        'id': user.get('id'),
        'email': user.get('email')
    }, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
    });
}

// search customer
router.get('/search/:customer_email', async (req, res) => {
    let email = req.params.customer_email;
    let custAcct = await Customer.where({
        'email': email
    }).fetch({
        require: false
    });
    res.send(custAcct)
});

// log into customer account
router.post('/login', async (req, res) => {
    let email = req.body.email;
    let pw = req.body.password;
    let custAcct = await Customer.where({
        'email': email,
    }).fetch({
        require: false
    });
    console.log(custAcct.toJSON());
    if (custAcct && custAcct.get('password')===pw){
        let accessToken = generateAccessToken(custAcct);
        res.send(accessToken);
    } else{
        res.status(404).json({error: 'the credentials do not match our record.'})
    }
    
});

// display profile page
router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const cust = req.user;
    res.send(user);
})

// create a new customer account
router.post('/create', async (req, res) => {
    const newAcct = new Customer({
        'firstName': req.body.fName,
        'lastName': req.body.lName,
        'email': req.body.email,
        'password': req.body.password,
        'phone_number': req.body.phone,
        'status': 'active'
    });
    await newAcct.save();
    console.log('new customer account is created successfully');
    res.send(newAcct);
});

const logIntoAcct = async (email, password) => {


}

const searchAcct = async (email) => {
    const custAcct = await Customer.where({
        'email': email
    }).fetch({
        require: false
    });
    return custAcct;
}

module.exports = router;