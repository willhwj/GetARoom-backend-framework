const { Customer} = require('../models');

const registerAcct = async (acctDetail) => {
    const newAcct = new Customer({
        'name': acctDetail.name,
        'email': acctDetail.email,
        'password': acctDetail.password,
        'phone_number': acctDetail.phone,
        'status': 'active'
    });
    await newAcct.save();
    console.log('new customer account is created successfully');
}

const logIntoAcct = async (email, password) => {


}

const searchAcct = async (email)=> {
    const custAcct = await Customer.where({
        'email': email
    }).fetch({
        require: false
    });
    return custAcct;
}

module.exports = {registerAcct, logIntoAcct, searchAcct}