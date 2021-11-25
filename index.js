const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// create an instance of express app
let app = express();

// set up the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(express.urlencoded({
    extended: false
}));


// import in routes
const landingRoutes = require('./routes/landing');
const roomTypeRoutes = require('./routes/room-types');
const roomRoutes = require('./routes/rooms');

async function main(){

    app.use('/', landingRoutes);
    app.use('/room-types', roomTypeRoutes);
    app.use('/rooms', roomRoutes);
}

main();

app.listen(3000, () => {
    console.log("Server has started");
})