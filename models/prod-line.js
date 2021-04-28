const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prodLineSchema = new Schema({
    name: {
        require: true,
        type: String,
        maxlength: 50
    },
    description: {
        type:String,
    }
})

prodLineSchema.virtual('url').get(function () {
    return '/api/linie-produkcyjne/' + this._id
 })
module.exports = mongoose.model('ProdLine', prodLineSchema)