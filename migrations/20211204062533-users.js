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
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, unsigned: true, autoIncrement: true},
    username: { type: 'string', length: 100},
    email: { type: 'string', length: 320},
    password: { type: 'string', length: 80},
    phone_number: { type: 'string', length: 45},
    status: { type: 'string', length: 45}
  });
};

exports.down = function(db) {
  return db.dropTable('user');
};

exports._meta = {
  "version": 1
};
