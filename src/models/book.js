const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    author: {
        type: [String],
        required: true
    },
    publisher: {
        type: [String],
        required: true
    },
    publishDate: {
        type: Date,
    },
    overview: {
        type: String,
    },
    numberOfPages: {
        type: Number,
    },
    imageUrls: {
        type: [String]
    }
});

const model = mongoose.model('Book', bookSchema, 'books');
module.exports = model;