// import in caolan forms
const forms = require('forms');
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object){
    if(!Array.isArray(object.widget.classes)) {
        object.widget.classes =[];
    }

    if (object.widget.classes.indexOf('form-control')=== -1){
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid': validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>': '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>';
    // return '<div class="form-group">' + label +  error + '</div>';
};

const createRoomForm = (roomTypes) => {
    return forms.create({
        'room_number': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.maxlength(100)]
        }),
        'room_price': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.min(300)]
        }),
        'room_type_id': fields.string({
            label: 'Room type',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: roomTypes
        })
    })
}

const createRoomTypeForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.maxlength(1000)]
        }),
        'inventory': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label:['form-label']
            },
            'validators': [validators.integer()]
        }),
        'room_size': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label:['form-label']
            },
            'validators': [validators.integer()]
        }),
        'base_hourly_cost': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'max_occupancy': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer(), validators.max(20)]
        })
    })
};

module.exports ={createRoomForm, createRoomTypeForm, bootstrapField};