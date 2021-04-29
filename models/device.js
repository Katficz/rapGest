const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  ip: {
    type: String,
    maxlength: 25,
  },
  deviceType: {
    type: Schema.Types.ObjectId,
    ref: 'DeviceType',
    required: true,
  },
  operation: {
    type: Schema.Types.ObjectId,
    ref: 'Operation',
  },
  prodLine: {
    type: Schema.Types.ObjectId,
    ref: 'ProdLine',
    required: true,
  },
  description: {
    type: String,
  },
})
deviceSchema.virtual('url').get(function () {
  return '/api/urzadzenia/' + this._id
})
module.exports = mongoose.model('Device', deviceSchema)
