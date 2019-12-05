var express = require('express');
var router = express.Router();
var Category = require('../models/category').model;
var SubCategory = require('../models/sub-category').model;
var Product = require('../models/product').model;
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

router.get('/discovery', function (req, res, next) {
    Category.find().then(result => {
        var list = JSON.parse(JSON.stringify(result));
        var promises = [];
        list.forEach(elm => {
            promises.push(Product.find({"category": elm._id}).limit(4).then(v => {
                elm.list = v;
            }));
        });
        const promise = Promise.all(promises);
        promise.then(v => {
            res.send({
                list: list
            });
        });
    });
});

router.get('/category', function (req, res, next) {
    Category.find().then(result => {
        res.send({
            list: result
        });
    });
});

router.post("/category", upload.single("file"), function (req, res) {
    console.log(req.body.title);
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            Category.create({
                    title: JSON.parse(req.body.title),
                    image: req.file.filename,
                    subCategory: req.body.subCategory ? JSON.parse(req.body.subCategory) : []
                },
                function (err, category) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the category.",
                        error: err
                    });
                    res.status(200).send({category: category});
                });
        }
    });
});

router.get("/category/getById", function (req, res) {
    let id = req.query.id;
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            Category.find({_id: id}, function (err, category) {
                if (!err) {
                    if (category.length > 0) {
                        res.status(200).send({category: category[0]});
                        return
                    }
                }
                res.status(404).send({"message": "category not found"});
            });
        }
    });
});

router.post("/category/edit", upload.single("file"), function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            let data = {
                title: JSON.parse(req.body.title),
                subCategory: req.body.subCategory ? JSON.parse(req.body.subCategory) : []
            };
            if (req.file && req.file.filename) {
                data.image = req.file.filename;
            }
            Category.findByIdAndUpdate(id, data, {new: true}, (err, category) => {
                res.status(200).send({category: category});
            });
        }
    });
});

router.post("/category/delete", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            Category.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.post("/sub-category/edit", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            SubCategory.findByIdAndUpdate(id, {
                title: req.body.title
            }, {new: true}, (err, sub_category) => {
                res.status(200).send({sub_category: sub_category});
            });
        }
    });
});

router.post("/sub-category/delete", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            SubCategory.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.post("/sub-category", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.body.category_id;

            Category.findById(id).then(result => {
                if (!result) {
                    return res.status(404).send({
                        message: "Category not found"
                    });
                }
                SubCategory.create({
                        title: req.body.title
                    },
                    function (err, sub_category) {
                        if (err) return res.status(500).send({
                            message: "There was a problem registering the sub category.",
                            error: err
                        });
                        result.subCategory.push(sub_category._id);
                        Category.findByIdAndUpdate(id, result, {new: true}, (err, result) => {
                            res.status(200).send({sub_category: sub_category});
                        });
                    });

            });
        }
    });
});

router.post("/sub-category/add", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            SubCategory.create({
                    title: req.body.title
                },
                function (err, sub_category) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the sub category.",
                        error: err
                    });
                    res.status(200).send({sub_category: sub_category});
                });
        }
    });
});

router.post("/sub-category/edit", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            SubCategory.findByIdAndUpdate(id, {
                title: req.body.title
            }, {new: true}, (err, sub_category) => {
                res.status(200).send({sub_category: sub_category});
            });
        }
    });
});

router.post("/sub-category/delete", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            SubCategory.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.post("/", upload.single("file"), function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            var title = JSON.parse(req.body.title);
            var description = JSON.parse(req.body.description);
            var obj = {
                title: title,
                description: description,
                price: req.body.price,
                complimentaryInfos: (req.body.complimentaryInfos) ? JSON.parse(req.body.complimentaryInfos) : [],
                category: req.body.category,
                subCategory: req.body.subCategory,
                image: req.file.filename,
                rating: 0
            };
            Product.create(obj,
                function (err, product) {
                    if (err) return res.status(500).send({
                        message: "There was a problem registering the category.",
                        error: err
                    });
                    res.status(200).send({product: product});
                });
        }
    });
});

router.post("/edit", upload.single("file"), function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        console.log("hi");
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            let data = {
                title: JSON.parse(req.body.title),
                description: JSON.parse(req.body.description),
                price: req.body.price,
                complimentaryInfos: (req.body.complimentaryInfos) ? JSON.parse(req.body.complimentaryInfos) : [],
                category: req.body.category,
                subCategory: req.body.subCategory
            };
            if (req.file && req.file.filename) {
                data.image = req.file.filename;
            }
            Product.findByIdAndUpdate(id, data, {new: true}, (err, category) => {
                res.status(200).send({product: category});
            });
        }
    });
});

router.post("/delete", function (req, res) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            Product.deleteMany({_id: id}).then(d => {
                res.status(200).send({});
            });
        }
    });
});

router.get('/', function (req, res, next) {
    Product.find().then(result => {
        res.send({
            list: result
        });
    });
});

router.post('/comment', function (req, res, next) {
    auth.getUserByToken(req.headers['authorization'], function (status, user) {
        if (status !== 200) {
            res.status(status).send({message: (status === 401) ? "non authorisé" : "Erreur technique"});
        } else {
            let id = req.query.id;
            let content = req.body.content;
            let rating = req.body.rating;
            Product.findById(id).then(result => {
                result.comments.push({
                    user: user._id,
                    content: content,
                    rating: rating
                });
                result.rating = (result.rating * (result.comments.length - 1) + rating) / result.comments.length;
                console.log(result.rating);
                Product.findByIdAndUpdate(id, result, {new: true}, (err, result) => {
                    res.send({
                        product: result
                    });
                });
            });
        }
    });
});

router.post('/search', function (req, res, next) {
    let categories = req.body.categories ? req.body.categories : [];
    let sub_categories = req.body.sub_categories ? req.body.sub_categories : [];
    let min_price = req.body.min_price ? Number.parseInt(req.body.min_price) : 0;
    let max_price = req.body.max_price ? Number.parseInt(req.body.max_price) : 99999;
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;

    var promise = Product.find({
        "price": {
            $gte: min_price,
            $lt: max_price
        }
    });

    if (categories.length > 0) {
        var array = [];
        categories.forEach(e => {
            array.push({
                "category": e
            });
        });
        console.log(array);
        promise.find({
            $or: array
        })
    }

    if (sub_categories.length > 0) {
        var array2 = [];
        sub_categories.forEach(e => {
            array2.push({
                "subCategory": e
            });
        });
        promise.find({
            $or: array2
        })
    }

    if (req.body.sort_by) {
        let sort_by = Number.parseInt(req.body.sort_by);
        if (sort_by === 1)
            promise.sort({date: 'desc'});
        else if (sort_by === 2)
            promise.sort({price: 'desc'});
    }

    promise.then(result => {
        res.send({
            list: result.slice(offset).slice(0, limit),
            size: result.length
        });
    });


});

router.get('/getById', function (req, res, next) {
    let id = req.query.id;
    Product.findById(id).then(result => {
        result.nbr_vue += 1;
        Product.findByIdAndUpdate(id, result, {new: true}, (err, result) => {
            res.send({
                product: result
            });
        });
    });
});

router.get('/autocomplete', function (req, res, next) {
    let q = req.query.q;
    var regex = new RegExp(q, 'i');
    var query = Product.find({
        $or: [
            {"title.fr": regex},
            {"title.eng": regex},
            {"title.it": regex},
            {"title.jp": regex}
        ]
    }).limit(10);
    query.then(result => {
        res.send({
            list: result
        });
    });
});


module.exports = router;