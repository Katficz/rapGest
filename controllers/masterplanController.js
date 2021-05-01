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
      res.render('plan-list', {
        masterplan_list: result,
      })
    })
}

// Display detail page for a specific plan.
exports.masterplan_detail = function (req, res, next) {
  Masterplan.findById(req.params.id)
    .populate('user')
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        let err = new Error('Nie znaleziono takiego planu')
        err.status(404)
        return next(err)
      }
      res.render('plan-detail', {
        title: 'Zaplanowane zadanie',
        masterplan: result,
      })
    })
}

// Display plan create form on GET.
exports.masterplan_create_get = function (req, res, next) {
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
    },
    function (err, result) {
      if (err) {
        return next(err)
      }
      // success
      res.render('plan-form', {
        users: result.users,
        lines: result.lines,
        devicetypes: result.devicetypes,
        devices: result.devices,
        operations: result.operations,
        shift_names: ['Poranna', 'Popołudniowa', 'Nocna'],
      })
    }
  )
}

// Handle plan create on POST.
exports.masterplan_create_post = [
  body('desc', 'Opis jest wymagany').isLength({ min: 1 }).escape(),
  body('date_created').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_execution').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('shift').escape().toInt(),
  body('isDone').escape().toBoolean(),
  body('comments').escape(),

  (req, res, next) => {
    const errors = validationResult(req)
    let dateExecution = new Date(req.body.date_execution)
    dateExecution.setHours(6, 0, 0, 0)
    let plan = new Plan({
      desc: req.body.desc,
      date_created: new Date(),
      date_execution: dateExecution,
      shift: req.body.shift,
      isDone: false,
      comments: req.body.comments,
      user: req.body.user,
    })

    if (!errors.isEmpty()) {
      User.find().exec(function (err, users) {
        if (err) {
          return next(err)
        }
        res.render('plan_form', {
          title: 'Zaplanuj pracę',
          user_list: users,
          plan: plan,
          shift_names: ['Poranna', 'Popołudniowa', 'Nocna'],
          errors: errors.array(),
        })
      })

      return
    } else {
      plan.save(function (err) {
        if (err) {
          return next(err)
        }
        exe0 = new Date(req.body.date_execution)
        exe24 = new Date(req.body.date_execution)
        exe0.setHours(6, 0, 0, 0)
        exe24.setHours(29, 59, 0, 0)

        Raport.findOneAndUpdate(
          {
            date: dateExecution,
            shift: req.body.shift,
          },
          { $push: { masterplan: plan._id } }
        ).exec(function (err, theraport) {
          if (err) {
            return next(err)
          }
          console.log('i found one and updated:', theraport)
        })

        res.redirect(plan.url)
      })
    }
  },
]

// Display plan delete form on GET.
exports.masterplan_delete_get = function (req, res, next) {
  async.parallel(
    {
      plan: function (callback) {
        Plan.findById(req.params.id).exec(callback)
      },
      // plan_raports: function (callback) {
      //    Raport.find({ plan: req.params.id }).exec(callback)
      // },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.plan == null) {
        // No results.
        res.redirect('/api/plan')
      }
      // Successful, so render.
      res.render('plan_delete', {
        title: 'Usuń plan',
        plan: results.plan,
      })
    }
  )
}
// Handle plan delete on POST.
exports.masterplan_delete_post = function (req, res) {
  async.parallel(
    {
      plan: function (callback) {
        Plan.findById(req.body.planid).exec(callback)
      },
      //plan_raport: function (callback) {
      //   Raport.find({ plan: req.body.planid }).exec(callback)
      //},
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      // Success
      // if (results.plan_devices.length > 0) {
      //    // plan has devices. Render in same way as for GET route.
      //    res.render('plan_delete', {
      //       title: 'Usuń linię',
      //       plan: results.plan,
      //       plan_devices: results.plan_devices,
      //    })
      //    return
      // } else {
      // Author has no books. Delete object and redirect to the list of authors.
      Plan.findByIdAndRemove(req.body.planid, function deletePlan(err) {
        if (err) {
          return next(err)
        }
        // Success - go to author list
        res.redirect('/api/plan')
      })
    }
  )
}
// Display plan update form on GET.
exports.masterplan_update_get = function (req, res, next) {
  async.parallel(
    {
      plan: function (callback) {
        Plan.findById(req.params.id).populate('user').exec(callback)
      },
      users: function (callback) {
        User.find(callback)
      },
    },

    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.plan == null) {
        let err = new Error('Plan not found')
        err.status = 404
        return next(err)
      }
      // Success
      res.render('plan_form', {
        title: 'Edytuj plan',
        shift_names: ['Poranna', 'Popołudniowa', 'Nocna'],
        plan: results.plan,
        user_list: results.users,
      })
    }
  )
}

// Handle plan update on POST.
exports.masterplan_update_post = [
  body('desc', 'Opis jest wymagany').isLength({ min: 1 }).escape(),
  body('date_created').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_execution').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('shift').escape().toInt(),
  body('isDone').escape().toBoolean(),
  body('comments').escape(),

  (req, res, next) => {
    const errors = validationResult(req)
    let dateExecution = new Date(req.body.date_execution)
    dateExecution.setHours(12, 0, 0, 0)
    let plan = new Plan({
      desc: req.body.desc,
      date_created: new Date(),
      date_execution: dateExecution,
      shift: req.body.shift,
      isDone: false,
      comments: req.body.comments,
      user: req.body.user,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      res.render('plan_form', {
        title: 'Edytuj plan',
        shift_names: ['Poranna', 'Popołudniowa', 'Nocna'],
        plan: plan,
      })
    } else {
      Plan.findByIdAndUpdate(req.params.id, plan, {}, function (err, theplan) {
        if (err) {
          return next(err)
        }
        res.redirect(theplan.url)
      })
    }
  },
]
