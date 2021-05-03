const Masterplan = require('../models/masterplan')
const Plan = require('../models/plan')
const User = require('../models/user')
const Device = require('../models/device')
const ProdLine = require('../models/prod-line')
const Operation = require('../models/operation')
const DeviceType = require('../models/device-type')
const Raport = require('../models/raport')

const async = require('async')
const { body, validationResult } = require('express-validator')

/* PLAN CONTROLLER*/

exports.plan_detail = function (req, res, next) {
  async.parallel(
    {
      plan: function (callback) {
        Plan.findById(req.params.id)
          .populate({
            path: 'device',
            model: 'Device',
          })
          .populate({
            path: 'line',
            model: 'ProdLine',
          })
          .populate({
            path: 'operation',
            model: 'Operation',
          })
          .populate({
            path: 'devicetype',
            model: 'DeviceType',
          })
          .exec(callback)
      },
      masterplan: function (callback) {
        Masterplan.findOne({ plans: req.params.id }).exec(callback)
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        let err = new Error('Nie znaleziono takiego planu')
        err.status(404)
        return next(err)
      }
      res.render('plan-detail', {
        title: 'Plan dzienny',
        plan: result.plan,
        masterplan: result.masterplan,
      })
    }
  )
}

// Display operation delete form on GET.
exports.plan_delete_get = function (req, res, next) {
  Plan.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result.operation == null) {
      // No results.
      res.redirect('/api/masterplan/calendar')
    }
    // Successful, so render.
    res.render('plan-delete', {
      plan: result,
    })
  })
}
// Handle operation delete on POST.
exports.plan_delete_post = function (req, res) {
  Plan.findByIdAndRemove(req.body.planid, function deletePlan(err) {
    if (err) {
      return next(err)
    }
    // Success - go to author list
    res.redirect('/api/masterplan/calendar')
  })
}

// Display operation update form on GET.
exports.plan_update_get = function (req, res, next) {
  async.parallel(
    {
      plan: function (callback) {
        Plan.findById(req.params.id).exec(callback)
      },
      lines: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      devicetypes: function (callback) {
        DeviceType.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      devices: function (callback) {
        Device.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      operations: function (callback) {
        Operation.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.plan == null) {
        var err = new Error('Plan not found')
        err.status = 404
        return next(err)
      }
      // success
      res.render('plan-form', {
        title: 'Edytuj Plan Dzienny',
        plan: results.plan,
        lines: results.lines,
        operations: results.operations,
        devicetypes: results.devicetypes,
        devices: results.devices,
      })
    }
  )
}

// Handle operation update on POST.
exports.plan_update_post = [
  body('name', 'nazwa jest wymagana').isLength({ min: 1 }).escape(),
  body('description').optional().escape(),
  body('line').optional().escape(),
  body('operation').optional().escape(),
  body('devicetype').optional().escape(),
  body('device').optional().escape(),
  body('orderNumber').optional().escape(),
  body('status').escape().toInt(),

  (req, res, next) => {
    const errors = validationResult(req)

    let plan = new Plan({
      name: req.body.name,
      description: req.body.description,
      line: req.body.line,
      operation: req.body.operation,
      devicetype: req.body.devicetype,
      device: req.body.device,
      orderNumber: req.body.orderNumber,
      status: req.body.status,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      res.render('plan-form', {
        title: 'Edytuj Plan Dzienny', // Żałosny Człowieku',
        operation: operation,
      })
    } else {
      Plan.findByIdAndUpdate(req.params.id, plan, {}, function (err) {
        if (err) {
          return next(err)
        }
        res.redirect(plan.url)
      })
    }
  },
]
