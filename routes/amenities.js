const express = require('express');
const router = express.Router();
// import in the forms
const {bootstrapField, createAmenityForm} = require('../forms');

// import in the Amenity model
const { Amenity} = require('../models');

// display amenities
router.get('/', async(req, res) =>{
    let amenities = await Amenity.collection().fetch();
    res.render('amenities/index', {
        'amenities': amenities.toJSON()
    })
});

// create amenities
router.get('/create', async(req, res)=> {
    const amenityForm = createAmenityForm();
    res.render('amenities/create', {
        'form': amenityForm.toHTML(bootstrapField)
    })
});

router.post('/create', async(req, res)=> {
    const amenityForm = createAmenityForm();
    amenityForm.handle(req, {
        'success': async (form)=> {
            const amenity = new Amenity(form.data);
            await amenity.save();
            res.redirect('/amenities');
        },
        'error': async (form) => {
            res.render('amenities/create', {
                'form': form.toHMTL(bootstrapField)
            })
        }
    })
})

// update amenity
router.get('/:amenity_id/update', async(req, res)=> {
    const amenityId = req.params.amenity_id;
    const amenity = await Amenity.where({
        'id': amenityId
    }).fetch({
        require: true
    });
    
    const amenityForm = createAmenityForm();
    amenityForm.fields.name.value = amenity.get('name');
    amenityForm.fields.description.value = amenity.get('description');

    res.render('amenities/update', {
        'form': amenityForm.toHTML(bootstrapField),
        'amenity': amenity.toJSON()
    })
})

router.post('/:amenity_id/update', async(req, res)=> {
    const amenity = await Amenity.where({
        'id': req.params.amenity_id
    }).fetch({
        require: true
    });

    const amenityForm = createAmenityForm();
    amenityForm.handle(req, {
        'success': async(form) => {
            amenity.set(form.data);
            amenity.save();
            res.redirect('/amenities');
        },
        'error': async(form)=> {
            res.render('amenities/update', {
                'form': form.toHTML(bootstrapField),
                'amenity': amenity.toJSON()
            })
        }
    })
})

// delete amenity
router.get('/:amenity_id/delete', async(req, res)=> {
    const amenity = await Amenity.where({
        'id': req.params.amenity_id,
    }).fetch({
        require: true
    });

    res.render('amenities/delete', {
        'amenity': amenity.toJSON()
    })
});

router.post('/:amenity_id/delete', async(req, res)=> {
    const amenity = await Amenity.where({
        'id': req.params.amenity_id
    }).fetch({
        require: true
    });
    await amenity.destroy();
    res.redirect('/amenities');
})

module.exports = router;