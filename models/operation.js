const mongoose = require('mongoose')

const Schema = mongoose.Schema

const OperationSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  line: { type: Schema.Types.ObjectId, ref: 'ProdLine' },
})

// Virtual for plan's URL
OperationSchema.virtual('url').get(function () {
  return '/api/operation/' + this._id
})

//Export model
module.exports = mongoose.model('Operation', OperationSchema)
