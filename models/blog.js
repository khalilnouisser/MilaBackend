const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

var BlogSchema = new Schema({
    title: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    content: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    nbr_vue: {type: Number, default: 0},
    user: {type: Schema.Types.ObjectId, ref: "User", autopopulate: true},
    cover_image: String,
    comments: [{
        user: {type: Schema.Types.ObjectId, ref: "User", autopopulate: true},
        content: String,
        creation_date: {type: Date, default: Date.now()}
    }],
    creation_date: {type: Date, default: Date.now()}
});

BlogSchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Blog', BlogSchema),
    schema: BlogSchema
};

