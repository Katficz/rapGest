const mongoose = require('mongoose');
require('mongoose-type-email');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        maxlength: 50
    },
    surname: {
        type: String,
        require: true,
        maxlength: 50
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        allowBlank: true,
        maxlength: 50
    },
    isAvaible: {
        type: Boolean,
        require: true,
        default: true,
    },
    isEmployed: {
        type: Boolean,
        require: true,
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
    }
})

userSchema.virtual('url').get(function () {
    return '/api/uzytkownicy/' + this._id
 })

module.exports = mongoose.model('User', userSchema)