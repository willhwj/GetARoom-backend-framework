const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// import in the User model
const { User } = require('../models');
const { registrationForm, loginForm, bootstrapField } = require('../forms');

// display registration form
router.get('/register', (req, res) => {
    const regForm = registrationForm();
    res.render('users/register', {
        'form': regForm.toHTML(bootstrapField)
    })
})

// process registration
router.post('/register', (req, res) => {
    const regForm = registrationForm();
    regForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': getHashedPassword(form.data.password),
                'phone_number': form.data.phone_number,
                'email': form.data.email
            });
            await user.save();
            req.flash('success_messages', 'User signed up successfully.')
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// login page
router.get('/login', (req, res) => {
    const login = loginForm();
    res.render('users/login', {
        'form': login.toHTML(bootstrapField)
    })
})

router.post('/login', (req, res) => {
    const login = loginForm();
    login.handle(req, {
        'success': async (form) => {
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            });
            if (!user) {
                req.flash('error_messages', 'Sorry, the authentication details you provided does not work.');
                req.redirect('/users/login');
            } else {
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    };
                    req.flash('success_messages', `Welcome back, ${user.get('username')}`);
                    req.session.save(function(err) {
                        // session saved
                        res.redirect('/users/profile');
                      })
                    
                } else {
                    req.flash('error_messages', 'Sorry, the authentication details you provides does not work.');
                    res.redirect('/users/login')
                }
            }
        },
        'error': (form) => {
            req.flash('error_messages', 'There are some problems logging you in. Please fill in the form again');
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// profile page for logged in user
router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})

// route for logged out user
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', 'Goodbye');
    req.session.destroy(function (err) {
    });
    res.redirect('/users/login');
})

module.exports = router;