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
  return db.createTable('amenities_room_types', {
    id: { type: 'int', primaryKey: true, unsigned: true, autoIncrement: true },
    amenity_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'amenities_room_types_amenity_fk',
        table: 'amenities',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    room_type_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'amenities_room_types_room_type_fk',
        table: 'room_types',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('amenities_room_types');
};

exports._meta = {
  "version": 1
};
