var express = require('express');
var router = express.Router();
var Partenaire = require('../models/partenaire').model;
var auth = require('../utils/auth');
var multer = require('multer');
var sftpStorage = require('multer-sftp');

const storage = sftpStorage({
    sftp: {
        host: 'ssh.cluster026.hosting.ovh.net',
        port: 22,
        username: 'milabgrofk',
        password: 'Mila14041311'
    },
    destination: function (req, file, cb) {
        cb(null, './www/images')
    },
    filename: function (req, file, cb) {
        let extension = file.originalname.split('.').pop();
        let fileName = file.originalname.split('.')[0];
        cb(null, fileName + '-' + Date.now() + '.' + extension)
    }
});

var upload = multer({storage: storage});


router.get('/', function (req, res, next) {
    Partenaire.find().then(result => {
        res.send({
            list: getRandomElementsFromArray(result, 6)
        });
    });
});

router.get('/all', function (req, res, next) {
    Partenaire.find().then(result => {
        res.send({
            list: result
        });
    });
});

router.post('/', upload.single("file"), function (req, res, next) {
    let token = req.headers['authorization'];
    console.log(token);
    auth.getUserByToken(token, function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            Partenaire.create({
                    image: 'http://milabgroup.com/images/' + req.file.filename
                },
                function (err, partenaire) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the partenaire.",
                        error: err
                    });
                    res.status(200).send({partenaire: partenaire});
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
            Partenaire.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
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