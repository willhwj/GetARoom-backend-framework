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
  return db.createTable('room_type_slots', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true},
    room_type_name: { type: 'string', length: 100},
    timeslot: { type: 'datetime'},
    price: { type: 'int', unsigned: true},
    inventory: { type: 'int', unsigned: true},
    room_type_id: {
      type: 'int',
      unsigned: true,
      foreignKey: {
        name: 'room_type_room_type_slot_fk',
        table: 'room_types',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        },
        mapping: 'id'
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('room_type_slots');
};

exports._meta = {
  "version": 1
};
