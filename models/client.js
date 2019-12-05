const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

const Schema = mongoose.Schema;

var ClientSchema = new Schema({
    content: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    name: String,
    poste: String,
    image: String,
    creation_date: {type: Date, default: Date.now()}
});

ClientSchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Client', ClientSchema),
    schema: ClientSchema
};

