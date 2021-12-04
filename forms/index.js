// import in caolan forms
const forms = require('forms');
// create some shortcuts
const fields = forms.fields;
const widgets = forms.widgets;
const validators = forms.validators;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }

    if (object.widget.classes.indexOf('form-control') === -1 && object.widget.classes.indexOf('form-check') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

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

const createRoomTypeForm = (amenities) => {
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
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'room_size': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
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
        }),
        'amenities': fields.array({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label:['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: amenities,
            validators: [validators.required()]
        })
    })
};

const createRoomSlotForm = (rooms) => {
    return forms.create({
        'available': fields.boolean({
            label: 'Available For Booking?',
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.checkbox({
                classes: ['form-check']
            })
        }),
        'day_of_week': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: {
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday'
            }
        }),
        'start_date': fields.date({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.date(),
            validators: [validators.required()]
        }),
        'end_date': fields.date({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.date(),
            validators: [
                validators.required(),
                function (form, field, callback) {
                    if (field.data < form.fields['start_date'].data) {
                        callback('end date must be the same as or further into the future than start date')
                    } else {
                        callback()
                    }
                }]
        }),
        'slots': fields.array({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: {
                'Morning': {
                    '08:00:00': '8:00am', '09:00:00': '9:00am', '10:00:00': '10:00am', '11:00:00': '11:00am', '12:00:00': '12:00pm'
                },
                'Afternoon': {
                    '13:00:00': '1:00pm', '14:00:00': '2:00pm', '15:00:00': '3:00pm', '16:00:00': '4:00pm', '17:00:00': '5:00pm'
                },
                'Evening': {
                    '18:00:00': '6:00pm', '19:00:00': '7:00pm', '20:00:00': '8:00pm', '21:00:00': '9:00pm', '22:00:00': '10:00pm', '23:00:00': '11:00pm'
                }
            },
            validators: [validators.required('Please select at least 1 slot to proceed')]
        }),
        'room_id': fields.array({
            label: 'Room number',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: rooms
        })
    })
}

const updateRoomSlotForm = () => {
    return forms.create({
        'available': fields.boolean({
            label: 'Available For Booking?',
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.checkbox({
                classes: ['form-check']
            }),
            // widget: widgets.checkbox()
        }),
        'price': fields.number({
            errorAfterField: true,
            cssClasses: {
                label:['form-label']
            },
            validators: [validators.required(), validators.integer()]
        }),
        'day_of_week': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.text({
                classes: ['readol']
            })
        }),
        // 'date': fields.date({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'timeslot': fields.array({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'room_id': fields.array({
        //     label: 'Room number',
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // })
    })
}

const createAmenityForm = ()=> {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.maxlength(100)]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label:['form-label']
            },
            'validators': [validators.maxlength(1000)]
        })
    })
}

const createRegistrationForm = ()=> {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.maxlength(100)]
        }),
        'email': fields.email({
            required: true,
            label: 'email address',
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.email()
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.password()
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.password(),
            validators: [validators.matchField('password')]
        }),
        'phone_number': fields.tel({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.tel()
        })
    })
}

module.exports = { createRoomForm, createRoomTypeForm, createRoomSlotForm, updateRoomSlotForm, createAmenityForm, createRegistrationForm, bootstrapField };