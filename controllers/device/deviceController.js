const Device = require('../../models/device')
const ProdLine = require('../../models/prod-line')
const Operation = require('../../models/operation')
const DeviceType = require('../../models/device-type')
const { body, validationResult } = require('express-validator')
const async = require('async')

exports.device_GET_all = function (req, res, next) {
  async.parallel(
    {
      line: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      device: function (callback) {
        Device.find()
          .populate('deviceType')
          .populate('operation')
          .exec(callback)
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('device-list', {
        title: 'Lista Urządzeń',
        device_list: result.device,
        devicetype_list: result.devicetype,
        line_list: result.line,
        operation_list: result.operation,
      })
    }
  )
}

exports.device_GET_add = function (req, res) {
  async.parallel(
    {
      prodLines: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      deviceTypes: function (callback) {
        DeviceType.find()
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
      res.render('device-add', {
        title: 'Dodaj urządzenie',
        devicetypes: result.deviceTypes,
        lines: result.prodLines,
        operations: result.operations,
      })
    }
  )
}

exports.device_POST_add = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Wypełnij pole Nazwa')
    .withMessage('Nieznany znak w polu Nazwa'),

  body('freeText').trim().optional({ checkFalsy: true }),

  body('name').custom((value) => {
    return Device.findOne({ name: value }).then((result) => {
      if (result) {
        return Promise.reject('Urządzenie ' + value + ' już istnieje')
      }
    })
  }),
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('device-add', {
        title: 'Dodaj urządzenie',
        errors: errors.array(),
      })
      return
    } else {
      const device = new Device({
        name: req.body.name,
        ip: req.body.ip,
        prodLine: req.body.prodLineId,
        deviceType: req.body.deviceTypeId,
        description: req.body.freeText,
        operation: req.body.operation,
      })
      device.save(function (err) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/urzadzenia')
      })
    }
  },
]

exports.device_GET_update = function (req, res, next) {
  async.parallel(
    {
      device: function (callback) {
        Device.findById(req.params.id)
          .populate('prodLine')
          .populate('deviceType')
          .populate('operation')
          .exec(callback)
      },
      prodLines: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      deviceTypes: function (callback) {
        DeviceType.find()
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
      res.render('device-add', {
        title: 'Edytuj urządzenie',
        device: result.device,
        devicetypes: result.deviceTypes,
        lines: result.prodLines,
        operations: result.operations,
      })
    }
  )
}

exports.device_POST_update = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Wypełnij pole Nazwa')
    .withMessage('Nieznany znakw polu Nazwa'),

  body('freeText').trim().optional({ checkFalsy: true }),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('im in error')
      res.render('device-list', {
        title: 'Dodaj urządzenie',
        errors: errors.array(),
      })
      return
    } else {
      console.log(req.params.id, ' tutaj samo id')
      Device.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        ip: req.body.ip,
        prodLine: req.body.prodLineId,
        deviceType: req.body.deviceTypeId,
        description: req.body.freeText,
        operation: req.body.operation,
      }).exec(function (err, result) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/urzadzenia/' + req.params.id)
      })
    }
  },
]

exports.device_GET_delete = function (req, res, next) {
  Device.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result == null) {
      // No results.
      res.redirect('/api/urzadzenia')
    }
    res.render('device-delete', {
      title: 'Usuń Urządzenie',
      device: result,
    })
  })
}

// Handle device delete on POST.
exports.device_POST_delete = function (req, res, next) {
  Device.findByIdAndRemove(req.body.deviceid, function (err) {
    if (err) {
      return next(err)
    }
    // Success - go to author list
    res.redirect('/api/urzadzenia')
  })
}

exports.device_GET_one = function (req, res, next) {
  Device.findById(req.params.id)
    .populate('prodLine')
    .populate('deviceType')
    .populate('operation')
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        let err = new Error('Nie znaleziono takiego urzadzenia')
        res.status(404)
        return next(err)
      }
      res.render('device-detail', { title: 'Urządzenie', device: result })
    })
}
