const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MasterplanSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  date: { type: Date, required: true },
  isDone: { type: Boolean, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  plans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
})

// Virtual for plan's URL
MasterplanSchema.virtual('url').get(function () {
  return '/api/masterplan/' + this._id
})

//Export model
module.exports = mongoose.model('Masterplan', MasterplanSchema)
