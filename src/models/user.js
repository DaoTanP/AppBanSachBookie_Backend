const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    gender: {
        type: Boolean
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        required: true
    }
});

const model = mongoose.model('User', userSchema, 'users');
module.exports = model;