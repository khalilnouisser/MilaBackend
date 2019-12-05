const mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

const Schema = mongoose.Schema;

var ProductSchema = new Schema({
    title: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    price: Number,
    rating: {type: Number, default: 0},
    nbr_vue: {type: Number, default: 0},
    description: {
        fr: String,
        eng: String,
        jp: String,
        it: String
    },
    image: String,
    complimentaryInfos: [{
        key: String,
        value: String
    }],
    comments: [{
        user: {type: Schema.Types.ObjectId, ref: "User", autopopulate: true},
        rating: Number,
        content: String,
        creation_date: {type: Date, default: Date.now()}
    }],
    category: {type: Schema.Types.ObjectId, ref: "Category", autopopulate: true},
    subCategory: {type: Schema.Types.ObjectId, ref: "SubCategory", autopopulate: true},
    creation_date: {type: Date, default: Date.now()}
});

ProductSchema.plugin(autopopulate);

module.exports = {
    model: mongoose.model('Product', ProductSchema),
    schema: ProductSchema
};

