const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var ContactSchema = new Schema({
    name: String,
    email: String,
    message: String,
    creation_date: {type: Date, default: Date.now()}
});

module.exports = {
    model: mongoose.model('Contact', ContactSchema),
    schema: ContactSchema
};

