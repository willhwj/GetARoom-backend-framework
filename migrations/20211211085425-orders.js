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
  return db.createTable('orders', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true},
    amount_paid: { type: 'int', unsigned: true},
    create_time: { type: 'datetime'},
    fulfilment_time: { type: 'datetime'},
    status: { type: 'string', length: 100},
    customer_id: {
      type: 'int',
      unsigned: true,
      foreignKey: {
        name: 'customer_order_fk',
        table: 'customers',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        },
        mapping: 'id'
      }
    },
    shopping_cart_id: {
      type: 'int',
      unsigned: true,
      foreignKey: {
        name: 'order_shopping_cart_fk',
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
  return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
