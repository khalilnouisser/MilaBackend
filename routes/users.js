var express = require('express');
var router = express.Router();
var User = require('../models/user').model;
var auth = require('../utils/auth');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

let transport = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 587,
    auth: {
        user: 'no-reply@milabgroup.com',
        pass: 'MilaBGroup'
    }
});

router.get('/', function (req, res, next) {
    User.find().then(result => {
        res.send({
            list: result
        });
    });
});

router.post('/login', function (req, res, next) {
    User.find({social_id: req.body.id, type: 'USER'}, function (err, users) {
        if (err || users.length === 0) {
            User.create({
                    fname: req.body.name.split(" ")[0],
                    lname: req.body.name.split(" ")[1],
                    email: req.body.email,
                    img_url: req.body.image,
                    social_token: req.body.token,
                    social_id: req.body.id,
                    social_provider: req.body.provider,
                    type: 'USER'
                },
                function (err, user) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the user.",
                        error: err
                    });
                    auth.generateToken(user._id, function (val) {
                        res.status(200).send({user: user, token: val});
                    });
                });
        } else {
            let user = users[0];
            auth.generateToken(user._id, function (val) {
                res.status(200).send({user: user, token: val});
            });
        }
    });

});

router.post('/admin', function (req, res, next) {
    let generatedKey = uuidv4();
    console.log(1);
    User.findUserByEmail(req.body.email, function (err, users) {
        if (!err && users.length > 0)
            return res.status(400).send({message: "exist email"});

        var user = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password,
            type: 'ADMIN',
            email_confirmation_key: generatedKey.toString()
        };
        if (req.body.img_url) {
            user.img_url = req.body.img_url;
        }
        console.log(req.body.password);
        User.create(user,
            function (err, user) {
                if (err) return res.status(500).send({
                    message: "There was a problem registering the user.",
                    error: err
                });
                let body = confirmationMailBody(user, req.body.password);
                transport.sendMail(body, function (err, info) {
                    res.status(200).send({user: user});
                });
            });
    });

});

router.post('/admin/confirm', function (req, res, next) {
    let key = req.query.key;
    console.log(key);
    User.find({email_confirmation_key: key}, function (err, users) {
        if (users.length > 0) {
            let user = users[0];
            User.findByIdAndUpdate(user._id, {email_confirmed: true, email_confirmation_key:''}, {$new: true}).then(d => {
                res.send({message: "user confirmed"});
            });
        } else {
            res.send({message: "user not found"});
        }
    })
});

router.post('/admin/reset/request', function (req, res, next) {
    User.findUserByEmail(req.body.email, function (err, users) {
        if (!err && users.length === 0)
            return res.status(404).send({message: "user not found"});
        let user = users[0];
        user.password_edit_key = uuidv4();
        User.findByIdAndUpdate(user._id, {password_edit_key: user.password_edit_key}, {$new: true}).then(d => {
            let body = passwordEditConfirmation(user);
            transport.sendMail(body, function (err, info) {
                res.status(200).send({user: user});
            });
            res.send({message: "mail sended"});
        });
    });
});

router.post('/admin/reset', function (req, res, next) {
    let key = req.query.key;
    let new_password = req.body.password;
    User.find({password_edit_key: key}, function (err, users) {
        if (users.length > 0) {
            let user = users[0];
            user.password = new_password;
            user.password_edit_key = "";
            bcrypt.hash(user.password, 10).then((hashedPassword) => {
                user.password = hashedPassword;
                User.findByIdAndUpdate(user._id, user, {$new: true}).then(d => {
                    res.send({message: "Password modified"});
                });
            });
        } else {
            res.send({message: "user not found"});
        }
    })
});

router.get('/me', function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            res.status(200).send(user);
        }
    });
});

router.post('/admin/login', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    console.log(req.body);
    User.findUserByEmail(email, function (err, users) {
        if (err || users.length === 0)
            return res.status(404).send({message: "user not found"});
        var user = users[0];
        user.comparePassword(password, function (err2, isMatch) {
            if (err2 || !isMatch)
                return res.status(404).send({message: "wrong password"});
            if (!user.email_confirmed) {
                return res.status(400).send({message: "mail not confirmed"});
            }
            auth.generateToken(user._id, function (val) {
                res.status(200).send({user: user, token: val});
            });
        });
    });
});

function confirmationMailBody(user, password) {

    return {
        from: 'Mila Business group<no-reply@milabgroup.com>',
        to: user.email,
        subject: 'You\'re invited to join Mila Administration Team',
        text: 'Dear ' + user.fname + ',\n' +
            '\n' +
            'You\'re invited to join Mila Administration Team. Please accept this invitation within seven days.\n\n' +
            'http://admin.milabgroup.com/#/login/mail/confirm/' + user.email_confirmation_key + '\n\n' +
            '-------------------------------------\n' +
            'Your username is: ' + user.email + '\n' +
            'Your password is: ' + password + '\n' +
            '-------------------------------------\n' +
            'If you have any questions, contact us.\n' +
            '\n' +
            'Best regards,\n' +
            'Mila Business Group' // Plain text body
    };

}

function passwordEditConfirmation(user) {

    return {
        from: 'Mila Business group<no-reply@milabgroup.com>',
        to: user.email,
        subject: 'Password Reset Request on Mila Administration',
        text: 'Dear ' + user.fname + ',\n' +
            '\n' +
            'You\'re receiving this email because you requested a password reset for your Mila administration Account.\n' +
            '\n' +
            'To choose a new password and complete your request, please follow the link below:\n' +
            'http://admin.milabgroup.com/#/login/reset-password/' + user.password_edit_key + '\n\n' +
            'You have received this email because someone requested a password reset for your email. If you did not request a password reset, your email address may have been entered by mistake and you can safely disregard this message.\n\n' +
            '-------------------------------------\n' +
            'If you have any questions, contact us.\n' +
            '\n' +
            'Best regards,\n' +
            'Mila Business Group' // Plain text body
    };

}

module.exports = router;
