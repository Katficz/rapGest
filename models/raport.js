const mongoose = require('mongoose')
const { DateTime } = require('luxon')

const Schema = mongoose.Schema

const raportSchema = new Schema({
  date: {
    type: Date,
    require: true,
  },
  teamPresent: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  teamAbsent: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  shift: {
    type: Number,
    enum: [1, 2, 3],
  },
  roundAround: {
    type: Object,
    default: {
      kettle: '',
      compressor: '',
      ice: '',
      electric: '',
      workshop: '',
      isKettle: false,
      isCompressor: false,
      isIce: false,
      isElectric: false,
      isWorkshop: false,
    }
  },
  failure: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Failure',
    },
  ],
  additionalInfo: {
    type: String,
  },
})

raportSchema.virtual('url').get(function () {
  return '/api/raporty/' + this._id
})

raportSchema.virtual('virtual_date').get(function () {
  return DateTime.fromJSDate(this.date).toFormat('dd.LL.yyyy')
})

module.exports = mongoose.model('Raport', raportSchema)
