var express = require('express');
var router = express.Router();
var Contact = require('../models/contact').model;
var auth = require('../utils/auth');

router.get('/', function (req, res, next) {
    let token = req.headers['authorization'];
    auth.getUserByToken(token, function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        }
        Contact.find().then(result => {
            res.send({
                list: result
            });
        });
    });
});


router.post('/', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            Contact.create({
                    name: req.body.name,
                    email: req.body.email,
                    message: req.body.message
                },
                function (err, blog) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the contact.",
                        error: err
                    });
                    res.status(200).send({});
                });
        }
    });
});

module.exports = router;