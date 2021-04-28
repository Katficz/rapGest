const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roundAroundSchema = new Schema({
    // note
    kettle: { type: String },
    compressor: { type: String },
    ice: { type: String },
    electric: { type: String },
    workshop: { type: String },
    // OK/NOK
    isKettle: { type: Boolean, required: true },
    isCompressor: { type: Boolean, required: true },
    isIce: { type: Boolean, required: true },
    isElectric: { type: Boolean, required: true },
    isWorkshop: { type: Boolean, required: true },
})

module.exports = mongoose.model('RoundAround', roundAroundSchema)