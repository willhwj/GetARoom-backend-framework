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
  return db.addColumn('cart_items', 'order_id', {
    type: 'int',
    unsigned: true,
    notNull: false,
    foreignKey: {
      name: 'cart_item_order_fk',
      table: 'orders',
      rules: {
        onDelete: 'cascade',
        onUpdate: 'restrict'
      },
      mapping: 'id'
    }
  });
};

exports.down = function(db) {
  return db.removeColumn('cart_items', 'order_id');
};

exports._meta = {
  "version": 1
};
