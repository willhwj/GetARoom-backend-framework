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
  return db.createTable('rooms', {
    id: { type:'int', unsigned:true, primaryKey: true, autoIncrement: true },
    room_number: { type:'string', length: 100},
    room_price: { type:'int', unsigned: true}
  });
};

exports.down = function(db) {
  return db.dropTable('rooms');
};

exports._meta = {
  "version": 1
};
