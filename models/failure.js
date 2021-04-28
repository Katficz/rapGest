const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const failureSchema = new Schema({
    
    startTime: {//..
        type: String, require: true,
    },
    duration: {//..
        type: String, require: true,
    },
    orderNum: {//
        type: String,
        maxlength: 50,
    },
    prodLine: {//..
        type: Schema.Types.ObjectId, ref: 'ProdLine',
        require: true,
    },
    deviceType: {//..
        type: Schema.Types.ObjectId, ref: 'DeviceType',
        require: true,
    },
    device: {//..
        type: Schema.Types.ObjectId, ref: 'Device',
        require: true,
    },
    cause: {//
        type: String,
    },
    diagnostics: {//
        type: String,
    },
    action: {//
        type: String,
    },
    effect: { //..
        type: Boolean,
    },
    plannedActions: { // JESZCZE NIE IMPLEMENTUJE
        type: String,
    },
    usedParts: {
        type: String,
    },
    missingParts: {
        type: String,
    }
})
module.exports = mongoose.model('Failure', failureSchema)