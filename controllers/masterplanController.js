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

// Display list of all plans.
exports.masterplan_list = function (req, res, next) {
  Masterplan.find()
    .sort([['date', 'descending']])
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('masterplan-list', {
        masterplan_list: result,
      })
    })
}

exports.masterplan_calendar = function (req, res, next) {
  async.parallel(
    {
      users: function (callback) {
        User.find().exec(callback)
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
      masterplans: function (callback) {
        Masterplan.find({ status: 2 })
          .sort([['date', 'descending']])
          .exec(callback)
      },
      plans: function (callback) {
        Plan.find({}, ['_id', 'name', 'dateStart', 'dateEnd', 'status']).exec(
          callback
        )
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }
      // take all PLANS and make calendar events out of them
      let events_list = []
      for (plan of result.plans) {
        events_list.push({
          id: plan._id,
          title: plan.name,
          start: plan.dateStart,
          end: plan.dateEnd,
          url: '/api/plan/' + plan._id,
        })
      }
      // success
      res.render('masterplan-calendar', {
        users: result.users,
        lines: result.lines,
        devicetypes: result.devicetypes,
        devices: result.devices,
        operations: result.operations,
        masterplans: result.masterplans,
        events_list: events_list,
      })
    }
  )
}

// Display detail page for a specific plan.
exports.masterplan_detail = function (req, res, next) {
  Masterplan.findById(req.params.id)
    .populate('user')
    .populate({
      path: 'plans',
      populate: {
        path: 'device',
        model: 'Device',
      },
    })
    .populate({
      path: 'plans',
      populate: {
        path: 'line',
        model: 'ProdLine',
      },
    })
    .populate({
      path: 'plans',
      populate: {
        path: 'operation',
        model: 'Operation',
      },
    })
    .populate({
      path: 'plans',
      populate: {
        path: 'devicetype',
        model: 'DeviceType',
      },
    })
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        let err = new Error('Nie znaleziono takiego planu')
        err.status(404)
        return next(err)
      }
      res.render('masterplan-detail', {
        title: 'Zaplanowane zadanie',
        masterplan: result,
      })
    })
}

// Display plan create form on GET.
exports.masterplan_create_get = function (req, res, next) {
  User.find()
    .sort([['name', 'ascending']])
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('masterplan-form', {
        users: result,
      })
    })
}

// Handle plan create on POST.
exports.masterplan_create_post = [
  body('name', 'Tytuł jest wymagany').isLength({ min: 1 }).escape(),
  body('desc', 'Opis jest wymagany').optional().escape(),
  body('user').isLength({ min: 1 }).escape(),
  body('status').isNumeric(),

  (req, res, next) => {
    const errors = validationResult(req)
    let masterplan = new Masterplan({
      name: req.body.name,
      desc: req.body.desc,
      date: new Date(),
      status: req.body.status,
      user: req.body.user,
    })

    if (!errors.isEmpty()) {
      User.find()
        .sort([['name', 'ascending']])
        .exec(function (err, result) {
          if (err) {
            return next(err)
          }
          res.render('masterplan-form', {
            users: result,
            masterplan: masterplan,
          })
        })
      return
    } else {
      masterplan.save(function (err) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/masterplan')
      })
    }
  },
]

// post method used in calendar view
exports.masterplan_saveNewPlan = [
  body('name', 'nazwa jest wymagana').isLength({ min: 1 }).escape(),
  body('description').optional().escape(),
  body('dateStart').isISO8601().toDate(),
  body('dateEnd').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('line').optional().escape(),
  body('operation').optional().escape(),
  body('devicetype').optional().escape(),
  body('device').optional().escape(),
  body('orderNumber').optional().escape(),
  body('status').escape().toInt(),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(500).json(errors)
      return next(errors)
    } else {
      let planObj = req.body
      planObj.date = new Date()
      let masterplanId = planObj.masterplanId
      delete planObj.masterplanId

      let plan = new Plan(planObj)

      plan.save(function (err) {
        if (err) {
          res.status(500).json(err)
          return next(err)
        }
      })
      Masterplan.findByIdAndUpdate(masterplanId, {
        $push: { plans: { _id: plan._id } },
      }).exec(function (err) {
        if (err) {
          res.status(500).json(err)
          return next(err)
        } else {
          res.status(200).json('Succes!')
        }
      })
    }
  },
]

// post method used in calendar view
exports.masterplan_updateExistingPlan = [
  body('dateStart').isISO8601().toDate(),
  body('dateEnd').optional({ checkFalsy: true }).isISO8601().toDate(),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(500).json(errors)
      return next(errors)
    } else {
      let modifiedPlan = req.body

      Plan.findByIdAndUpdate(
        modifiedPlan.id,
        {
          _id: modifiedPlan.id,
          dateStart: modifiedPlan.dateStart,
          dateEnd: modifiedPlan.dateEnd,
        },
        function (err) {
          if (err) {
            res.status(500).json(err)
            return next(err)
          } else {
            res.status(200).json('Succes!')
          }
        }
      )
    }
  },
]

// Display plan delete form on GET.
exports.masterplan_delete_get = function (req, res, next) {
  Masterplan.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result == null) {
      // No results.
      res.redirect('/api/masterplan')
    }
    // Successful, so render.
    res.render('masterplan-delete', {
      title: 'Usuń plan',
      masterplan: result,
    })
  })
}
// Handle plan delete on POST.
exports.masterplan_delete_post = function (req, res) {
  Masterplan.findByIdAndRemove(req.body.planid, function deletePlan(err) {
    if (err) {
      return next(err)
    }
    // Success - go to author list
    res.redirect('/api/masterplan')
  })
}

// Display plan update form on GET.
exports.masterplan_update_get = function (req, res, next) {
  async.parallel(
    {
      masterplan: function (callback) {
        Masterplan.findById(req.params.id).populate('user').exec(callback)
      },
      users: function (callback) {
        User.find(callback)
      },
    },

    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.masterplan == null) {
        let err = new Error('Plan not found')
        err.status = 404
        return next(err)
      }
      // Success
      res.render('masterplan-form', {
        title: 'Edytuj plan',
        masterplan: results.masterplan,
        users: results.users,
      })
    }
  )
}

// Handle plan update on POST.
exports.masterplan_update_post = [
  body('name', 'Tytuł jest wymagany').isLength({ min: 1 }).escape(),
  body('desc', 'Opis jest wymagany').optional().escape(),
  body('user').isLength({ min: 1 }).escape(),
  body('status').isNumeric(),

  (req, res, next) => {
    const errors = validationResult(req)
    let masterplan = new Masterplan({
      name: req.body.name,
      desc: req.body.desc,
      date: new Date(),
      status: req.body.status,
      user: req.body.user,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      User.find()
        .sort([['name', 'ascending']])
        .exec(function (err, result) {
          if (err) {
            return next(err)
          }
          res.render('masterplan-form', {
            users: result,
            masterplan: masterplan,
          })
        })
    } else {
      Masterplan.findByIdAndUpdate(
        req.params.id,
        masterplan,
        {},
        function (err) {
          if (err) {
            return next(err)
          }
          res.redirect(masterplan.url)
        }
      )
    }
  },
]
