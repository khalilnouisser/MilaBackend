const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

var KpiSchema = new Schema({
    title: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    value: String
});

KpiSchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Kpi', KpiSchema),
    schema: KpiSchema
};

