// set up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
        user: 'room',
        password: 'Ch1ck3nr1c3!23',
        database: 'get_a_room'
    }
})

const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;