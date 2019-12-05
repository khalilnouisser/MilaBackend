var express = require('express');
var router = express.Router();
var User = require('../models/user').model;
var auth = require('../utils/auth');


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
    User.findUserByEmail(req.body.email, function (err, users) {
        if (!err && users.length > 0)
            return res.status(400).send({message: "exist email"});
    });
    var user = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        type: 'ADMIN'
    };
    if (req.body.img_url) {
        user.img_url = req.body.img_url;
    }
    User.create(user,
        function (err, user) {
            if (err) return res.status(500).send({
                message: "There was a problem registering the user.",
                error: err
            });
            auth.generateToken(user._id, function (val) {
                res.status(200).send({user: user, token: val});
            });
        });
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
            auth.generateToken(user._id, function (val) {
                res.status(200).send({user: user, token: val});
            });
        });
    });
});


module.exports = router;
