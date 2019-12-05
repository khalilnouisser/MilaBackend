const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

const Schema = mongoose.Schema;

var CategorySchema = new Schema({
    title: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    image: String,
    subCategory: [{type: Schema.Types.ObjectId, ref: "SubCategory", autopopulate: true}],
    creation_date: {type: Date, default: Date.now()}
});

CategorySchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Category', CategorySchema),
    schema: CategorySchema
};

