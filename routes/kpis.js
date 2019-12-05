var express = require('express');
var router = express.Router();
var Blog = require('../models/blog').model;
var Kpi = require('../models/kpi').model;
var auth = require('../utils/auth');

router.get('/', function (req, res, next) {
    Kpi.find().then(result => {
        res.send({
            list: result
        });
    });
});


router.post('/', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            Kpi.create({
                    title: req.body.title,
                    value: req.body.value
                },
                function (err, blog) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the blog.",
                        error: err
                    });
                    res.status(200).send({blog: blog});
                });
        }
    });
});

router.post('/update', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            Kpi.findByIdAndUpdate(id, {
                    title: req.body.title,
                    value: req.body.value
                }, {new: true}, (err, result) => {
                if (err) {
                    res.status(400).send({"message": "Erreur technique"});
                } else {
                    res.send({
                        blog: result
                    });
                }
            });
        }
    });
});

module.exports = router;