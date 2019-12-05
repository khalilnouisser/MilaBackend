var express = require('express');
var router = express.Router();
var ClientModel = require('../models/client').model;
var auth = require('../utils/auth');

router.get('/', function (req, res, next) {
    ClientModel.find().then(result => {
        res.send({
            list: getRandomElementsFromArray(result, 3)
        });
    });
});

router.get('/all', function (req, res, next) {
    ClientModel.find().then(result => {
        res.send({
            list: result
        });
    });
});

router.post('/', function (req, res, next) {
    let token = req.headers['authorization'];
    auth.getUserByToken(token, function (status, user) {
        console.log(status);
        console.log("here");
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            console.log(req.body);
            ClientModel.create(req.body,
                function (err, client) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the client.",
                        error: err
                    });
                    res.status(200).send({client: client});
                });
        }
    });
});

router.get('/getById', function (req, res, next) {
    let token = req.headers['authorization'];
    let id = req.query.id;
    auth.getUserByToken(token, function (status, user) {
        console.log(status);
        console.log("here");
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            console.log(req.body);
            ClientModel.find({_id: id}).then(d => {
                if (d.length > 0) {
                    res.status(200).send({client: d[0]});
                } else {
                    res.status(404).send({});
                }
            });
        }
    });
});

router.post('/delete', function (req, res, next) {
    let token = req.headers['authorization'];
    let id = req.query.id;
    auth.getUserByToken(token, function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            ClientModel.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.post('/update', function (req, res, next) {
    let token = req.headers['authorization'];
    let id = req.query.id;
    auth.getUserByToken(token, function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            console.log(req.body);
            ClientModel.findByIdAndUpdate(id, req.body, {new: true}, (err, result) => {
                res.status(200).send({client: result});
            });
        }
    });
});

function getRandomElementsFromArray(array, numberOfRandomElementsToExtract = 1) {
    const elements = [];

    function getRandomElement(arr) {
        if (elements.length < numberOfRandomElementsToExtract) {
            const index = Math.floor(Math.random() * arr.length);
            const element = arr.splice(index, 1)[0];

            if (element) {
                elements.push(element);
            }

            return getRandomElement(arr)
        } else {
            return elements
        }
    }

    return getRandomElement([...array])
}

module.exports = router;