const express = require('express');
const router = express.Router();
// const dataLayerCustomers = require('../../dal/customers');
const { Customer } = require('../../models');

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
router.get('/login/:customer_email/:password', async (req, res) => {
    let email = req.params.customer_email;
    let pw = req.params.password;
    let custAcct = await Customer.where({
        'email': email,
        'password':pw
    }).fetch({
        require: false
    });
    if (custAcct){
        res.send(custAcct)
    } else{
        res.status(404).json({error: 'the credentials do not match our record.'})
    }
    
});

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