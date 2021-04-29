const Raport = require('../models/raport')
const User = require('../models/user')
const Failure = require('../models/failure')

const ProdLine = require('../models/prod-line')
const DeviceType = require('../models/device-type')
const Device = require('../models/device')

const async = require('async')
const failure = require('../models/failure')
//HOME PAGE

exports.raport_GET_list = function (req, res) {
  console.log(req.cookies)
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
      for (var i = 4; i > 0; i--) {
        dates.push(
          startDate.getDate() +
            i +
            '-' +
            (startDate.getMonth() + 1) +
            '-' +
            (startDate.getYear() + 1900)
        )
      }
      for (var i = 1; i < 5; i++) {
        var match = false
        for (var j = 0; j < result.shiftC.length; j++) {
          if (result.shiftC[j].date.getDate() == startDate.getDate() + i) {
            console.log(
              'porownuje: ',
              result.shiftC[j].date.getDate(),
              ' z ',
              startDate.getDate() + i
            )
            shiftC.push(result.shiftC[j].url)
            match = true
          }
        }
        if (!match) {
          shiftC.push(0)
        }
      }
      for (var i = 1; i < 5; i++) {
        var match = false
        for (var j = 0; j < result.shiftB.length; j++) {
          if (result.shiftB[j].date.getDate() == startDate.getDate() + i) {
            shiftB.push(result.shiftB[j].url)
            match = true
          }
        }
        if (!match) {
          shiftB.push(0)
        }
      }
      for (var i = 1; i < 5; i++) {
        var match = false
        for (var j = 0; j < result.shiftA.length; j++) {
          if (result.shiftA[j].date.getDate() == startDate.getDate() + i) {
            shiftA.push(result.shiftA[j].url)
            match = true
          }
        }
        if (!match) {
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
  console.log(req.body)
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
  //if raport for this shift exists - this login
  //redirect to this raport
  //if if raport for this shift doesnt exist
  //create new one and redirect for the raport of this shift
  //redirecting, so the id is in the url
  const shiftLoggedIn = 2
  var nowDate = new Date()

  res.clearCookie('test', {path:'/'})

  saveDate = new Date()
  saveDate.setHours(10)

  startDate = new Date()
  endDate = new Date()
  if (
    shiftLoggedIn != 3 ||
    (nowDate.getHours() > 6 && nowDate.getHours() < 24)
  ) {
    startDate.setHours(8, 00)
    endDate.setHours(24)

    Raport.findOne({
      shift: shiftLoggedIn,
      date: {
        // searching for the same day between 0 - 24
        $gte: startDate,
        $lte: endDate,
      },
    }).exec(function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        User.find({
          shift: shiftLoggedIn,
          isAvaible: true,
        }).exec(function (err, team) {
          if (err) {
            res.status(500).json(err)
            return next(err)
          }
          raport = new Raport({
            date: saveDate,
            shift: shiftLoggedIn,
            teamAbsent: team,
            teamPresent: [],
          })
          raport.save()
          res.redirect(raport.url + '/edytuj')
        })
      } else {
        res.redirect(result.url + '/edytuj')
      }
    })
  }
  // raport for the 3rd shift, created between 0-6 will be created with previous days date and hours 24
  if (shiftLoggedIn == 3 && 6 > nowDate.getHours() && 0 < nowDate.getHours()) {
    startDate.setHours(8, 00)
    endDate.setHours(24)

    startDate.setDate(startDate.getDate() - 1)
    endDate.setDate(startDate.getDate() - 1)

    Raport.findOne({
      shift: shiftLoggedIn,
      date: {
        // searching for the previous date 6 - 24
        $gte: startDate,
        $lte: nowDate,
      },
    }).exec(function (err, result) {
      if (err) {
        return next(err)
      }
      if (result == null) {
        User.find({
          shift: shiftLoggedIn,
          isAvaible: true,
        }).exec(function (err, team) {
          if (err) {
            res.status(500).json(err)
            return next(err)
          }

          raport = new Raport({
            date: saveDate,
            shift: shiftLoggedIn,
            teamAbsent: team,
            teamPresent: [],
          })
          raport.save()
          res.redirect(raport.url + '/edytuj')
        })
      } else {
        res.redirect(result.url + '/edytuj')
      }
    })
  }
}

exports.raport_GET_one = function (req, res) {
  res.send('get specific raport GET NI')
}
