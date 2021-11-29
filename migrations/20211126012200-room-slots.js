'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('room_slots', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true},
    room_type: { type: 'string', length: 100},
    price: { type: 'int', unsigned: true},
    status: { type: 'string', length: 100},
    day_of_week: { type: 'string', length: 100},
    date: { type: 'date'},
    timeslot: {type: 'datetime'}
  });
};

exports.down = function(db) {
  return db.dropTable('room_slots');
};

exports._meta = {
  "version": 1
};
