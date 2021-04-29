const Operation = require('../../models/operation')
const Device = require('../../models/device')
const ProdLine = require('../../models/prod-line')
const { body, validationResult } = require('express-validator')
const async = require('async')

// Display list of all operations.
exports.operation_list = function (req, res, next) {
  Operation.find()
    .populate('line')
    .exec(function (err, list_operations) {
      if (err) {
        return next(err)
      }
      res.render('operation_list', {
        operation_list: list_operations,
      })
    })
}

// Display detail page for a specific operation.
// (low prioriy implementation)
exports.operation_detail = function (req, res) {
  Operation.findById(req.params.id)
    .populate('line')
    .exec(function (err, operation) {
      if (err) {
        return next(err)
      }
      if (operation == null) {
        let err = new Error('Nie znaleziono takiej operacji')
        err.status(404)
        return next(err)
      }
      res.render('operation_detail', { operation: operation })
    })
}

// Display operation create form on GET.
exports.operation_create_get = function (req, res, next) {
  ProdLine.find()
    .sort([['name', 'ascending']])
    .exec(function (err, lines) {
      if (err) {
        return next(err)
      }

      res.render('operation_form', { title: 'Utwórz Operację', lines: lines })
    })
}

// Handle operation create on POST.
// It's an Array !
exports.operation_create_post = [
  body('name', 'Nazwa operacji jest wymagana.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('line', 'Linia musi zostać podana.').isLength({ min: 1 }).escape(),

  // custom validator that checks if a operation with given name already exists
  body('name').custom((value) => {
    return Operation.findOne({ name: value }).then((operation) => {
      if (operation) {
        return Promise.reject('Nazwa już jest w użyciu')
      }
    })
  }),
  //process request after validation and sanitization
  (req, res, next) => {
    // extract the validation errors from a request
    const errors = validationResult(req)

    let operation = new Operation({ name: req.body.name, line: req.body.line })

    if (!errors.isEmpty()) {
      // if there are errors, render the form
      ProdLine.find()
        .sort([['name', 'ascending']])
        .exec(function (err, lines) {
          if (err) {
            return next(err)
          }

          res.render('operation_form', {
            title: 'Utwórz Operację',
            lines: lines,
          })
        })
      return
    } else {
      // if there are no errors, save operation and redirect to 'view all operations' route
      operation.save(function (err) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/operation')
      })
    }
  },
]

// Display operation delete form on GET.
exports.operation_delete_get = function (req, res, next) {
  async.parallel(
    {
      operation: function (callback) {
        Operation.findById(req.params.id).exec(callback)
      },
      operation_devices: function (callback) {
        Device.find({ operation: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.operation == null) {
        // No results.
        res.redirect('/api/operation')
      }
      // Successful, so render.
      res.render('operation_delete', {
        operation: results.operation,
        operation_devices: results.operation_devices,
      })
    }
  )
}
// Handle operation delete on POST.
exports.operation_delete_post = function (req, res) {
  async.parallel(
    {
      operation: function (callback) {
        Operation.findById(req.body.operationid).exec(callback)
      },
      operation_devices: function (callback) {
        Device.find({ operation: req.body.operationid }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      // Success
      if (results.operation_devices.length > 0) {
        // operation has devices. Render in same way as for GET route.
        res.render('operation_delete', {
          title: 'Usuń linię',
          operation: results.operation,
          operation_devices: results.operation_devices,
        })
        return
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        Operation.findByIdAndRemove(
          req.body.operationid,
          function deleteOperation(err) {
            if (err) {
              return next(err)
            }
            // Success - go to author list
            res.redirect('/api/operation')
          }
        )
      }
    }
  )
}
// Display operation update form on GET.
exports.operation_update_get = function (req, res) {
  async.parallel(
    {
      operation: function (callback) {
        Operation.findById(req.params.id).exec(callback)
      },
      line: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.operation == null) {
        var err = new Error('Operation not found')
        err.status = 404
        return next(err)
      }
      // success
      res.render('operation_form', {
        title: 'Edytuj Operację',
        operation: results.operation,
        lines: results.line,
      })
    }
  )
}

// Handle operation update on POST.
exports.operation_update_post = [
  body('name', 'Nazwa linii jest wymagana.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('line', 'Linia musi zostać podana.').isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req)

    let operation = new Operation({
      name: req.body.name,
      line: req.body.line,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      res.render('operation_form', {
        title: 'Edytuj linię',
        operation: operation,
      })
    } else {
      Operation.findByIdAndUpdate(
        req.params.id,
        operation,
        {},
        function (err, theoperation) {
          if (err) {
            return next(err)
          }
          res.redirect(theoperation.url)
        }
      )
    }
  },
]
