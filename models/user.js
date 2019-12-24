const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    social_id: String,
    social_token: String,
    social_provider: String,
    email_confirmed: {type: Boolean, default: false},
    email_confirmation_key: String,
    password_edit_key: String,
    img_url: {type: String, default: "https://i.imgur.com/1PyBTYl.png"},
    type: {type: String, enum: ['USER', 'ADMIN']},
    creation_date: {type: Date, default: Date.now()},
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next()
    }
    bcrypt.hash(user.password, 10).then((hashedPassword) => {
        user.password = hashedPassword;
        next();
    });
}, function (err) {
    next(err);
});

UserSchema.methods.comparePassword = function (candidatePassword, next) {
    bcrypt.hash(candidatePassword, 10).then((hashedPassword) => {
        console.log(hashedPassword);
    });
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return next(err);
        next(null, isMatch)
    })
};

UserSchema.plugin(autopopulate);
UserSchema.statics.findUserByEmail = function (email, callback) {
    return this.find({email: email}, callback);
};
module.exports = {
    model: mongoose.model('User', UserSchema),
    schema: UserSchema
};