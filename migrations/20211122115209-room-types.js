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
  return db.createTable('room_types', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true },
    name: { type: 'string', length:100, notNull: true },
    description: { type: 'text'},
    inventory: { type: 'int', unsigned: true},
    room_size: { type: 'int', unsigned: true },
    base_hourly_cost: { type: 'int', unsigned: true},
    max_occupancy: { type: 'int', unsigned: true}
  });
};

exports.down = function(db) {
  return db.dropTable('room_types');
};

exports._meta = {
  "version": 1
};
