const { Amenity} = require('../models');

const getAllAmenities = async()=> {
    return await Amenity.fetchAll().map(amenity => [amenity.get('id'), amenity.get('name')]);
};

module.exports = { getAllAmenities}