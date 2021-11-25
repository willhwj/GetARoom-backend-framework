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
  return db.addColumn('rooms', 'room_type_id', {
    type: 'int',
    unsigned: true,
    notNull: true,
    foreignKey: {
      name: 'room_type_fk',
      table: 'room_types',
      rules: {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      mapping: 'id'
    }
  });
};

exports.down = function(db) {
  return db.removeColumn('rooms', 'room_type_id');
};

exports._meta = {
  "version": 1
};
