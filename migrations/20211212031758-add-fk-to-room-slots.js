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
  return db.addColumn('room_slots', 'cart_item_id', {
    type: 'int',
    unsigned: true,
    notNull: false,
    foreignKey: {
      name: 'cart_item_room_slot_fk',
      table: 'room_slots',
      rules: {
        onDelete: 'cascade',
        onUpdate: 'restrict'
      },
      mapping: 'id'
    }
  });
};

exports.down = function(db) {
  return db.removeColumn('room_slots', 'cart_item_id');
};

exports._meta = {
  "version": 1
};
