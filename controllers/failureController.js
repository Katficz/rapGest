const Masterplan = require('../models/masterplan')
const Plan = require('../models/plan')
const User = require('../models/user')
const Device = require('../models/device')
const ProdLine = require('../models/prod-line')
const Operation = require('../models/operation')
const DeviceType = require('../models/device-type')
const Raport = require('../models/raport')
const Failure = require('../models/failure')

const async = require('async')
const { body, validationResult } = require('express-validator')

exports.failure_detail = function (req, res, next) {
  async.parallel(
    {
      failure: function (callback) {
        Failure.findById(req.params.id)
          .populate('prodLine')
          .populate('operation')
          .populate('deviceType')
          .populate('device')
          .populate('author')
          .populate('collaborators')
          .exec(callback)
      },
      raport: function (callback) {
        Raport.findOne({ failure: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results == null) {
        let err = new Error('Nie znaleziono takiej awarii')
        err.status(404)
        return next(err)
      }
      res.render('failure-detail', {
        failure: results.failure,
        raport: results.raport,
      })
    }
  )
}
