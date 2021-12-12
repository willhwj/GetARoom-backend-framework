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
  return db.createTable('cart_items', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true},
    price: { type: 'int', unsigned: true},
    timeslot: { type: 'datetime'},
    quantity: { type: 'int', unsigned: true},
    status: { type: 'string', length: 100},
    room_type_name: { type: 'string', length: 100},
    shopping_cart_id: {
      type: 'int',
      unsigned: true,
      foreignKey: {
        name: 'cart_item_shopping_cart_fk',
        table: 'shopping_carts',
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
  return db.dropTable('cart_items');
};

exports._meta = {
  "version": 1
};
