const mongoose = require('mongoose')

const Schema = mongoose.Schema

const failureSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  endDate: {
    type: Date,
  },
  startDate: {
    type: Date,
  },
  shift: { type: Number, required: true },
  orderNum: {
    type: String,
    maxlength: 50,
  },
  prodLine: {
    type: Schema.Types.ObjectId,
    ref: 'ProdLine',
  },
  operation: {
    type: Schema.Types.ObjectId,
    ref: 'Operation',
  },
  deviceType: {
    type: Schema.Types.ObjectId,
    ref: 'DeviceType',
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
  },
  cause: {
    type: String,
  },
  diagnostics: {
    type: String,
  },
  action: {
    type: String,
  },
  // effect: {
  //   type: Boolean,
  // },
  status: { type: Number },
  plannedActions: {
    //ESZCZE NIE IMPLEMENTUJE
    type: String,
  },
  usedParts: {
    type: String,
  },
  missingParts: {
    type: String,
  },
})
module.exports = mongoose.model('Failure', failureSchema)
