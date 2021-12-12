const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");

require("dotenv").config();

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

const csrf = require('csurf');

// create an instance of express app
let app = express();

// set up the view engine
app.set("view engine", "hbs");
const helpers = require('handlebars-helpers')({
    handlebars: hbs.handlebars
});

// static folder
app.use(express.static("public"));

// set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(express.urlencoded({
    extended: false
}));

// use sessions
app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true}
}))

// set up flash
app.use(flash());
// register flash middleware
// app.use(function(req, res, next){
//     res.locals.success_messages = req.flash('success_messages');
//     // console.log('locals is inside middleware', res.locals.success_messages);
//     res.locals.error_messages = req.flash('error_messages');
//     console.log(req.session);
//     next();
// })

// share user data with all hbs files
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
})

// enable CSRF
app.use(csrf());
// handle CSRF error
app.use(function (err, req, res, next){
    if(err && err.code =='EBADCSRFTOKEN'){
        req.flash('error_messages', 'The form has expired. Please try again');
        res.redirect('back');
    } else{
        next()
    }
})
// share CSRF with hbs files
app.use(function(req, res, next){
    res.locals.csrfToken = req.csrfToken();
    next();
})

// import in routes
const landingRoutes = require('./routes/landing');
const roomTypeRoutes = require('./routes/room-types');
const roomRoutes = require('./routes/rooms');
const roomSlotRoutes = require('./routes/room-slots');
const amenityRoutes = require('./routes/amenities');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const api = {
    shopping: require('./routes/api/shopping')
};

async function main(){

    app.use('/', landingRoutes);
    app.use('/room-types', roomTypeRoutes);
    app.use('/rooms', roomRoutes);
    app.use('/room-slots', roomSlotRoutes);
    app.use('/amenities', amenityRoutes);
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/api/shopping', express.json() ,api.shopping);
}

main();

app.listen(3000, () => {
    console.log("Server has started");
})