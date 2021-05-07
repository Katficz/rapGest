const Masterplan = require('../models/masterplan')
const Plan = require('../models/plan')
const User = require('../models/user')
const Device = require('../models/device')
const ProdLine = require('../models/prod-line')
const Operation = require('../models/operation')
const DeviceType = require('../models/device-type')
const Raport = require('../models/raport')
const Failure = require('../models/failure')
const mongoose = require('mongoose')

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
      res.render('search-form-raport', {
        users_list: result,
      })
    })
}

// Send the search form for finding raports
exports.search_raport_post = function (req, res, next) {
  let searchForm = req.body
  let query = {}
  if (searchForm.shift) {
    query.shift = searchForm.shift
  }
  if (searchForm.dateStart && searchForm.dateEnd) {
    query.date = {
      $gte: searchForm.dateStart,
      $lte: searchForm.dateEnd,
    }
  } else {
    if (searchForm.dateStart && !searchForm.dateEnd) {
      query.date = { $gte: searchForm.dateStart }
    }
    if (searchForm.dateEnd && !searchForm.dateStart) {
      query.date = { $lte: searchForm.dateEnd }
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
  //console.log('Query:', query)

  Raport.find(query, ['_id', 'shift', 'date', 'failure']).exec(function (
    err,
    result
  ) {
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
  async.parallel(
    {
      users: function (callback) {
        User.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      lines: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      operations: function (callback) {
        Operation.find()
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
      raport: function (callback) {
        Raport.findOne({ failure: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      res.render('search-form-failure', {
        users: results.users,
        lines: results.lines,
        operations: results.operations,
        devicetypes: results.devicetypes,
        devices: results.devices,
        raport: results.raport,
      })
    }
  )
}

// Send the search form for finding failures
exports.search_failure_post = function (req, res, next) {
  let searchForm = req.body
  // Those fields are returned just like with the find() metehod
  let projectFields = {
    $project: {
      _id: 1,
      startDate: 1,
      endDate: 1,
      shift: 1,
      author: 1,
      prodLine: 1,
      operation: 1,
      deviceType: 1,
      device: 1,
      status: 1,
      timespan: { $subtract: ['$endDate', '$startDate'] },
    },
  }
  // query statements
  let $match = {}

  if (searchForm.status) {
    $match['status'] = Number(searchForm.status)
  }
  if (searchForm.shift) {
    $match['shift'] = Number(searchForm.shift)
  }
  if (searchForm.author) {
    //{ $match : { author : "dave" } }
    $match['author'] = mongoose.Types.ObjectId(searchForm.author)
  }
  // if (searchForm.collaborators) {
  //   //{ $match : { author : "dave" } }
  //   $match['collaborators'] = ''
  // }
  if (searchForm.line) {
    $match['prodLine'] = mongoose.Types.ObjectId(searchForm.line)
  }
  if (searchForm.operation) {
    $match['operation'] = mongoose.Types.ObjectId(searchForm.operation)
  }
  if (searchForm.devicetype) {
    $match['deviceType'] = mongoose.Types.ObjectId(searchForm.devicetype)
  }
  if (searchForm.device) {
    $match['device'] = mongoose.Types.ObjectId(searchForm.device)
  }
  if (searchForm.timespanLt && searchForm.timespanGt) {
    $match['timespan'] = {
      $lte: Number(searchForm.timespanLt),
      $gte: Number(searchForm.timespanGt),
    }
  } else if (searchForm.timespanLt) {
    $match['timespan'] = {
      $lte: Number(searchForm.timespanLt),
    }
  } else if (searchForm.timespanGt) {
    $match['timespan'] = {
      $gte: Number(searchForm.timespanGt),
    }
  }
  /*
    █▀▄ ▄▀█ ▀█▀ █▀▀ █▀
    █▄▀ █▀█ ░█░ ██▄ ▄█
  */
  if (searchForm.dateStart) {
    $match['startDate'] = { $gte: new Date(searchForm.dateStart) }
  }
  if (searchForm.dateEnd) {
    $match['endDate'] = { $lte: new Date(searchForm.dateEnd) }
  }
  /*
    █░█ █▀█ █░█ █▀█ █▀
    █▀█ █▄█ █▄█ █▀▄ ▄█
  */
  // if (searchForm.hourStart) {
  //   $match['hourStart'] = { $gte: searchForm.hourStart }
  // }
  // if (searchForm.hourEnd) {
  //   $match['hourEnd'] = { $lt: searchForm.hourEnd }
  // }

  let queryAgg = [projectFields, { $match }]

  console.log('Query:', queryAgg)
  console.log('Query:', $match)

  Failure.aggregate(queryAgg).exec(function (err, result) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    } else {
      // Success
      res.status(200).json(result)
    }
  })
}

// Fill the search form for finding plans
exports.search_plan_get = function (req, res, next) {
  res.send('NOT IMPLEMENTED: search page get')
}

// Fill the search form for finding plans
exports.search_plan_post = function (req, res, next) {
  res.render('NOT IMPLEMENTED: search page post')
}
