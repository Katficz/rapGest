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

// Fill the search form for finding raports
exports.search_raport_get = function (req, res, next) {
  User.find()
    .sort([['name', 'ascending']])
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('search-form-raport.pug', {
        users_list: result,
      })
    })
}

// Send the search form for finding raports
exports.search_raport_post = function (req, res, next) {
  let searchForm = req.body
  let dE = new Date(searchForm.dateEnd)
  dE.setHours(24, 0, 0, 0)
  let query = {}
  if (searchForm.shift) {
    query.shift = searchForm.shift
  }
  if (searchForm.dateStart && searchForm.dateEnd) {
    query.date = {
      $gte: searchForm.dateStart,
      $lte: dE,
    }
  } else {
    if (searchForm.dateStart && !searchForm.dateEnd) {
      query.date = { $gte: searchForm.dateStart }
    }
    if (searchForm.dateEnd && !searchForm.dateStart) {
      query.date = { $lte: dE }
    }
  }
  if (searchForm.teamPresent) {
    query.teamPresent = { $all: searchForm.teamPresent }
  }
  if (searchForm.teamAbsent) {
    query.teamAbsent = { $all: searchForm.teamAbsent }
  }
  if (searchForm.roundAround) {
    query['roundAround.' + searchForm.roundAround] = false
  }
  console.log('Query:', query)

  Raport.find(query).exec(function (err, result) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    } else {
      // Success

      res.status(200).json(result)
    }
  })
}

// Fill the search form for finding failures
exports.search_failure_get = function (req, res, next) {
  res.send('NOT IMPLEMENTED: search page get')
}

// Send the search form for finding failures
exports.search_failure_post = function (req, res, next) {
  res.render('NOT IMPLEMENTED: search page post')
}

// Fill the search form for finding plans
exports.search_plan_get = function (req, res, next) {
  res.send('NOT IMPLEMENTED: search page get')
}

// Fill the search form for finding plans
exports.search_plan_post = function (req, res, next) {
  res.render('NOT IMPLEMENTED: search page post')
}
