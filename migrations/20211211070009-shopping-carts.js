'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('shopping_carts', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true },
    create_time: { type: 'datetime' },
    last_modified_time: { type: 'datetime' },
    cart_expiry: { type: 'datetime' },
    transaction_status: { type: 'string', length: 100 },
    payment_status: { type: 'boolean' },
    quantity_total: { type: 'int', unsigned: true },
    total_price: { type: 'int', unsigned: true },
    customer_id: {
      type: 'int',
      unsigned: true,
      foreignKey: {
        name: 'customer_shopping_cart_fk',
        table: 'customers',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        },
        mapping: 'id'
      }
    }
  });
};

exports.down = function (db) {
  return db.dropTable('shopping_carts');
};

exports._meta = {
  "version": 1
};
