const mongoose = require('mongoose')
require('mongoose-type-email')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  surname: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    maxlength: 100,
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
    default: 'technik',
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
})

userSchema.virtual('url').get(function () {
  return '/api/uzytkownicy/' + this._id
})

// Virtual for user's full name
userSchema.virtual('fullname').get(function () {
  return this.surname + ', ' + this.name
})

module.exports = mongoose.model('User', userSchema)
