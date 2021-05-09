const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceTypeSchema = new Schema({
  name: {
    require: true,
    type: String,
    maxlength: 400,
  },
  description: {
    type: String,
  },
})

deviceTypeSchema.virtual('url').get(function () {
  return '/api/typy-urzadzen/' + this._id
})

module.exports = mongoose.model('DeviceType', deviceTypeSchema)
