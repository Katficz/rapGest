const mongoose = require('mongoose')
const { DateTime } = require('luxon')

const Schema = mongoose.Schema

const PlanSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  dateStart: { type: Date },
  dateEnd: { type: Date },
  shift: { type: Number },
  line: { type: Schema.Types.ObjectId, ref: 'Line' },
  operation: { type: Schema.Types.ObjectId, ref: 'Operation' },
  devicetype: { type: Schema.Types.ObjectId, ref: 'Devicetype' },
  device: { type: Schema.Types.ObjectId, ref: 'Device' },
  orderNumber: { type: String },
  isParalyzing: { type: Boolean, required: true },
  status: { type: Number, required: true },
  comments: { type: String },
})

// Virtual for plan's URL
PlanSchema.virtual('url').get(function () {
  return '/api/plan/' + this._id
})

PlanSchema.virtual('virtual_date_created').get(function () {
  return DateTime.fromJSDate(this.date_created).toFormat('dd.LL.yyyy')
})
PlanSchema.virtual('virtual_date_execution').get(function () {
  return DateTime.fromJSDate(this.date_execution).toFormat('dd.LL.yyyy')
})

//Export model
module.exports = mongoose.model('Plan', PlanSchema)
