const mongoose = require('mongoose')

const Schema = mongoose.Schema

const OperationSchema = new Schema({
  name: { type: String, required: true, maxlength: 400 },
  description: {
    type: String,
  },
})

// Virtual for plan's URL
OperationSchema.virtual('url').get(function () {
  return '/api/operation/' + this._id
})

//Export model
module.exports = mongoose.model('Operation', OperationSchema)
