var jwt = require('jsonwebtoken');
var User = require('../models/user').model;
var tokenKey = require('../key').tokenKey;

var getUserByToken = function (token, callback) {
    if (!token) {
        callback(401,null);
        return;
    }
    token = token.split(" ")[1];
    jwt.verify(token, tokenKey, function (err, decoded) {
        if (err) {
            callback(500,null);
            return;
        }
        User.findById(decoded.id).then(d=>{
            callback(200,d);
        }).catch(er=>{
            callback(404,null);
        });
    });
};

var generateToken = function (userId, callback) {
    const token = jwt.sign({id: userId}, tokenKey, {
        expiresIn: 86400 * 30
    });
    callback(token);
};

module.exports = {
  getUserByToken, generateToken
};