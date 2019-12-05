var express = require('express');
var router = express.Router();
var Blog = require('../models/blog').model;
var auth = require('../utils/auth');

router.get('/', function (req, res, next) {
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    Blog.find({}).limit(limit).then(result => {
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
            Blog.create({
                    title: req.body.title,
                    content: req.body.content,
                    user: user._id,
                    cover_image: req.body.cover_image
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

router.post('/delete', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            Blog.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.get('/getById', function (req, res, next) {
    let id = req.query.id;
    Blog.findById(id).then(result => {
        result.nbr_vue += 1;
        Blog.findByIdAndUpdate(id, result, {new: true}, (err, result) => {
            res.send({
                blog: result
            });
        });
    });
});

router.get('/admin/getById', function (req, res, next) {
    let id = req.query.id;
    Blog.findById(id).then(result => {
        res.send({
            blog: result
        });
    });
});

router.post('/update', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            let content = req.body.content;
            Blog.findByIdAndUpdate(id, {content: content}, {new: true}, (err, result) => {
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

router.post('/comment', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            let content = req.body.content;
            Blog.findById(id).then(result => {
                console.log(result);
                result.comments.push({
                    user: user._id,
                    content: content
                });
                Blog.findByIdAndUpdate(id, result, {new: true}, (err, result) => {
                    res.send({
                        blog: result
                    });
                });
            });
        }
    });
});


module.exports = router;

