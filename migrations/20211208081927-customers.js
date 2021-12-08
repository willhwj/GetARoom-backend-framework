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
  return db.createTable('customers', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true},
    firstName: { type: 'string', length: 100},
    lastName: { type: 'string', length: 200},
    email: { type: 'string', length: 320},
    password: { type: 'string', length: 80},
    phone_number: { type: 'string', length: 45},
    status: { type: 'string', length: 45}
  });
};

exports.down = function(db) {
  return db.dropTable('customer');
};

exports._meta = {
  "version": 1
};
