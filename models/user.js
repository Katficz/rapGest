const mongoose = require('mongoose');
require('mongoose-type-email');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        maxlength: 50,
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    surname: {
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        allowBlank: true,
        maxlength: 50
    },
    isAvaible: {
        type: Boolean,
        required: true,
        default: true,
    },
    isEmployed: {
        type: Boolean,
        required: true,
        default: true,
    },
    position: {
        type: String,
        required: true,
        default: 'technik'
    },
    permission: {
        type: String,
        required: true,
        default: 'technik',
    },
    shift: {
        type: Number,
        required: true,
        default: 0,
    },
    password: {
        type: String,
        required: true,
        man: 1024,
        min: 6,
    }
})

userSchema.virtual('url').get(function () {
    return '/api/uzytkownicy/' + this._id
 })

module.exports = mongoose.model('User', userSchema)