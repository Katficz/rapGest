const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceSchema = new Schema({
  name: {
    type: String,
    require: true,
    maxlength: 50,
  },
  ip: {
    type: String,
    maxlength: 25,
  },
  deviceType: {
    type: Schema.Types.ObjectId,
    ref: 'DeviceType',
    require: true,
  },
  prodLine: {
    type: Schema.Types.ObjectId,
    ref: 'ProdLine',
    require: true,
  },
  description: {
    type: String,
  },
})
deviceSchema.virtual('url').get(function () {
  return '/api/urzadzenia/' + this._id
})
module.exports = mongoose.model('Device', deviceSchema)
