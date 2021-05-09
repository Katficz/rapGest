const Operation = require('../../models/operation')
const Device = require('../../models/device')
const ProdLine = require('../../models/prod-line')
const { body, validationResult } = require('express-validator')
const async = require('async')

// Display list of all operations.
exports.operation_list = function (req, res, next) {
  Operation.find()
    .sort([['name', 'ascending']])
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
  Operation.findById(req.params.id).exec(function (err, operation) {
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
  res.render('operation_form', { title: 'Utwórz Operację' })
}

// Handle operation create on POST.
// It's an Array !
exports.operation_create_post = [
  body('name', 'Nazwa operacji jest wymagana.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('freeText').trim().optional({ checkFalsy: true }),

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

    let operation = new Operation({
      name: req.body.name,
      description: req.body.freeText,
    })

    if (!errors.isEmpty()) {
      // if there are errors, render the form
      res.render('operation_form', {
        title: 'Utwórz Operację',
        operation: operation,
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
  Operation.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result == null) {
      // No results.
      res.redirect('/api/operation')
    }
    // Successful, so render.
    res.render('operation_delete', {
      operation: result,
    })
  })
}
// Handle operation delete on POST.
exports.operation_delete_post = function (req, res, next) {
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

// Display operation update form on GET.
exports.operation_update_get = function (req, res) {
  Operation.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result == null) {
      var err = new Error('Operation not found')
      err.status = 404
      return next(err)
    }
    // success
    res.render('operation_form', {
      title: 'Edytuj Operację',
      operation: result,
    })
  })
}

// Handle operation update on POST.
exports.operation_update_post = [
  body('name', 'Nazwa linii jest wymagana.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('freeText').trim().optional({ checkFalsy: true }),

  (req, res, next) => {
    const errors = validationResult(req)

    let operation = new Operation({
      name: req.body.name,
      description: req.body.freeText,
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
