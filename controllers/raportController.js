const Raport = require('../models/raport')
const User = require('../models/user')
const Failure = require('../models/failure')

const ProdLine = require('../models/prod-line')
const DeviceType = require('../models/device-type')
const Device = require('../models/device')

const async = require('async')
const failure = require('../models/failure')

const { DateTime } = require('luxon')
//HOME PAGE

exports.raport_GET_list = function (req, res) {
  startDate = new Date()
  startDate.setTime(
    startDate.getTime() + startDate.getTimezoneOffset() * 60 * 1000
  )
  startDate.setDate(startDate.getDate() - 4)
  async.parallel(
    {
      shiftA: function (callback) {
        Raport.find({
          shift: 1,
          date: {
            $gte: startDate,
          },
        })
          .sort('+date')
          .exec(callback)
      },
      shiftB: function (callback) {
        Raport.find({
          shift: 2,
          date: {
            $gte: startDate,
          },
        })
          .sort('+date')
          .exec(callback)
      },
      shiftC: function (callback) {
        Raport.find({
          shift: 3,
          date: {
            $gte: startDate,
          },
        })
          .sort('+date')
          .exec(callback)
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }
      var shiftA = []
      var shiftB = []
      var shiftC = []
      var dates = []
      var pushDate = startDate
      for (var i = 4; i > 0; i--) {
        pushDate.setDate(pushDate.getDate()+1)
        dates.push(DateTime.fromJSDate(pushDate).toFormat('dd.LL.yyyy'))
      }
      console.log(dates)
      for(var i = 0; i<dates.length;i++) {
        var match = false
        for(var j = 0; j < result.shiftC.length; j++) {
          if(result.shiftC[j].virtual_date==dates[i]) {
            shiftC.push(result.shiftC[j].url)
            match = true
          }
        }
        if(!match) {
          shiftC.push(0)
        }
      }
      for(var i = 0; i<dates.length;i++) {
        var match = false
        for(var j = 0; j < result.shiftB.length; j++) {
          if(result.shiftB[j].virtual_date==dates[i]) {
            shiftB.push(result.shiftB[j].url)
            match = true
          }
        }
        if(!match) {
          shiftB.push(0)
        }
      }
      for(var i = 0; i<dates.length;i++) {
        var match = false
        for(var j = 0; j < result.shiftA.length; j++) {
          if(result.shiftA[j].virtual_date==dates[i]) {
            shiftA.push(result.shiftA[j].url)
            match = true
          }
        }
        if(!match) {
          shiftA.push(0)
        }
      }

      res.render('raport-list-home', {
        title: 'Witaj! Wybierz raport',
        shiftA: shiftA,
        shiftB: shiftB,
        shiftC: shiftC,
        dates: dates,
      })
    }
  )
}

exports.raport_GET_update = function (req, res, next) {
  async.parallel(
    {
      raport: function (callback) {
        Raport.findById(req.params.id)
          .populate('teamPresent')
          .populate('teamAbsent')
          .populate({
            path: 'failure',
            populate: {
              path: 'prodLine',
              model: 'ProdLine',
            },
          })
          .populate({
            path: 'failure',
            populate: 'deviceType',
          })
          .populate({
            path: 'failure',
            populate: 'device',
          })
          .exec(callback)
      },
      deviceTypes: function (callback) {
        DeviceType.find().sort().exec(callback)
      },
      prodLines: function (callback) {
        ProdLine.find().sort().exec(callback)
      },
      devices: function (callback) {
        Device.find().sort().exec(callback)
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }

      res.render('raport-update', {
        title:
          'Edytuj Raport zmiany ' +
          result.raport.shift +
          ' z dnia ' +
          result.raport.virtual_date,
        data: result,
        absent: result.raport.teamAbsent,
        present: result.raport.teamPresent,
      })
    }
  )
}

exports.raport_POST_saveAdditionalInfo = function (req, res, next) {
  Raport.findByIdAndUpdate(req.params.id, {
    additionalInfo: req.body.roundAround,
  }).exec(function (err) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    } else {
      res.status(200).json('Succes!')
    }
  })
}

exports.raport_POST_saveRoundAround = function (req, res) {
  Raport.findByIdAndUpdate(req.params.id, {
    roundAround: req.body,
  }).exec(function (err) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    } else {
      res.status(200).json('Succes!')
    }
  })
}

exports.raport_POST_saveTeam = function (req, res) {
  Raport.findByIdAndUpdate(req.params.id, {
    teamPresent: req.body.teamPresent,
    teamAbsent: req.body.teamAbsent,
  }).exec(function (err) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    } else {
      res.status(200).json('Succes!')
    }
  })
  //Raport.findByIdAndUpdate(req.params._id)
}

exports.raport_POST_deleteFailure = function (req, res) {
  var failureId = req.body.failureId
  var raportId = req.params.id

  Raport.findByIdAndUpdate(req.params.id, {
    $pullAll: { failure: [req.body.failureId] },
  }).exec(function (err, result) {
    if (err) {
      res.status(500).json(err)
      return next(err)
    }
    Failure.findByIdAndDelete(req.body.failureId).exec(function (err, result) {
      if (err) {
        res.status(500).json(err)
        return next(err)
      }
      res.status(200).json('Succes!')
    })
  })
}

exports.raport_POST_saveFailure = function (req, res) {
  if (req.body.failureId) {
    var id = req.body.failureId
    delete req.body.failureId
    failure.findByIdAndUpdate(id, req.body).exec(function (err, result) {
      if (err) {
        res.status(500).json({ error: err })
      }
      res.status(200).json(result)
    })
    return
  }

  if (!req.body.failureId) {
    delete req.body.failureId
    const failure = new Failure(req.body)
    failure.save(function (err) {
      if (err) {
        //return next(err)
        res.status(500).json({ error: err })
      }
      if (!err) {
        Raport.findByIdAndUpdate(req.params.id, {
          $push: { failure: failure._id, ref: 'Failure' },
        }).exec(function (err) {
          if (err) {
            return next(err)
          }
          res.status(200).json(failure)
        })
      }
    })
  }
}

exports.raport_POST_update = function (req, res) {
  res.send('update raport POST NI')
}

exports.raport_GET_myRaport = function (req, res, next) {
  res.send('zmiana tutaj bedzie!')
}

exports.raport_GET_one = function (req, res) {
  res.send('get specific raport GET NI')
}

exports.raport_GET_failures = function(req, res, next) { 
  res.send('get failure')
}
exports.raport_GET_firstSection = function(req, res, next) {
  
  res.send('get first section ni')
}



