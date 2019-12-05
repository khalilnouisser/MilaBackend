const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

const Schema = mongoose.Schema;

var PartenaireSchema = new Schema({
    link: String,
    image: String,
    creation_date: {type: Date, default: Date.now()}
});

PartenaireSchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Partenaire', PartenaireSchema),
    schema: PartenaireSchema
};

