const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

const Schema = mongoose.Schema;

var SubCategorySchema = new Schema({
    title: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    creation_date: {type: Date, default: Date.now()}
});

SubCategorySchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('SubCategory', SubCategorySchema),
    schema: SubCategorySchema
};

