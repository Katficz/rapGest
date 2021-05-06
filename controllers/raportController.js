const Raport = require('../models/raport')
const User = require('../models/user')
const Failure = require('../models/failure')

const ProdLine = require('../models/prod-line')
const DeviceType = require('../models/device-type')
const Device = require('../models/device')
const Operation = require('../models/operation')

const async = require('async')
const failure = require('../models/failure')

const { DateTime } = require('luxon')
const { DocumentProvider } = require('mongoose')

//HOME PAGE
exports.raport_GET_list = function (req, res) {
  startDate = new Date()
  // this is bad
  startDate.setHours(startDate.getHours() + 2)
  // just setHours(0,0,0,0) and use getDate - 3
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
        pushDate.setDate(pushDate.getDate() + 1)
        dates.push(DateTime.fromJSDate(pushDate).toFormat('dd.LL.yyyy'))
      }
      for (var i = 0; i < dates.length; i++) {
        var match = false
        for (var j = 0; j < result.shiftC.length; j++) {
          if (result.shiftC[j].virtual_date == dates[i]) {
            shiftC.push(result.shiftC[j].url)
            match = true
          }
        }
        if (!match) {
          shiftC.push(0)
        }
      }
      for (var i = 0; i < dates.length; i++) {
        var match = false
        for (var j = 0; j < result.shiftB.length; j++) {
          if (result.shiftB[j].virtual_date == dates[i]) {
            shiftB.push(result.shiftB[j].url)
            match = true
          }
        }
        if (!match) {
          shiftB.push(0)
        }
      }
      for (var i = 0; i < dates.length; i++) {
        var match = false
        for (var j = 0; j < result.shiftA.length; j++) {
          if (result.shiftA[j].virtual_date == dates[i]) {
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
          .populate({
            path: 'failure',
            populate: 'author',
          })
          .populate({
            path: 'failure',
            populate: 'operation',
          })
          .exec(callback)
      },
      deviceTypes: function (callback) {
        DeviceType.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      prodLines: function (callback) {
        ProdLine.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      operations: function (callback) {
        Operation.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
      devices: function (callback) {
        Device.find()
          .sort([['name', 'ascending']])
          .exec(callback)
      },
    },
    function (err, result) {
      if (err) {
        return next(err)
      }

      var roundAroundPlaces = [
        ['kettle', 'isKettle', 'Kotłownia'],
        ['compressor', 'isCompressor', 'Kompresownia'],
        ['ice', 'isIce', 'Wieża Chłodu'],
        ['electric', 'isElectric', 'Rozdzielnia'],
        ['workshop', 'isWorkshop', 'Warsztat'],
      ]
      var canUpdate = true
      if (req.verifiedPerm == 'technik') canUpdate = false
      res.render('raport-update', {
        title:
          'Edytuj Raport zmiany ' +
          result.raport.shift +
          ' z dnia ' +
          result.raport.virtual_date,
        data: result,
        absent: result.raport.teamAbsent,
        present: result.raport.teamPresent,
        roundAroundPlaces: roundAroundPlaces,
      })
    }
  )
}
///FETCH ENDPOINTS FOR RAPORTS FIRST SECTION
exports.raport_POST_saveAdditionalInfo = function (req, res, next) {
  Raport.findByIdAndUpdate(req.params.id, {
    additionalInfo: req.body.additionalInfo,
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

exports.raport_POST_saveTeam = function (req, res, next) {
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
//FETCH FIRST SECTIO ENDS HERE

// get ONLY failures for .../awarie endpoint
exports.raport_GET_failures = function (req, res, next) {
  if (req.verifiedShift != 0) {
    async.parallel(
      {
        specialists: function (callback) {
          User.find({
            permission: 'specjalista',
            isAvaible: true,
          }).exec(callback)
        },
        raport: function (callback) {
          Raport.findById(req.verifiedMyRaportId)
            .populate('teamPresent')
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
            .populate({
              path: 'failure',
              populate: 'collaborators',
            })
            .populate({
              path: 'failure',
              populate: 'author',
            })
            .exec(callback)
        },
        deviceTypes: function (callback) {
          DeviceType.find()
            .sort([['name', 'ascending']])
            .exec(callback)
        },
        prodLines: function (callback) {
          ProdLine.find()
            .sort([['name', 'ascending']])
            .exec(callback)
        },
        operations: function (callback) {
          Operation.find()
            .sort([['name', 'ascending']])
            .exec(callback)
        },
        devices: function (callback) {
          Device.find()
            .sort([['name', 'ascending']])
            .exec(callback)
        },
      },
      function (err, result) {
        if (err) {
          return next(err)
        }
        User.findById(req.verifiedId).exec(function (err, loggedInUser) {
          if (err) {
            return next(err)
          }
          coWorkers = result.raport.teamPresent.concat(result.specialists)
          res.render('raport-failures', {
            title: 'Edytuj awarie',
            myRaport: result.raport,
            deviceTypes: result.deviceTypes,
            prodLines: result.prodLines,
            operations: result.operations,
            devices: result.devices,
            coWorkers: coWorkers,
            loggedInUser: loggedInUser,
          })
        })
      }
    )
  }
  if (req.verifiedShift == 0) {
    console.log(req.verifiedPerm)
    if (req.verifiedPerm == 'admin' || req.verifiedPerm == 'specjalista') {
      res.render('redirect-access-denied', {
        title: 'Edytuj wybrany raport przez kalendarz',
        url: '/api/raporty',
      })
    }
    if (req.verifiedPerm == 'technik') {
      res.render('redirect-access-denied', {
        title:
          'Brak możliwości edycji - Nie zostałeś dodany do żadnej dzisiejszej zmiany',
        url: '/api/raporty',
      })
    }
  }
}

//FETCH ENDPOINTS FOR RAPORT MANAGMENT
exports.raport_POST_deleteFailure = function (req, res) {
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

exports.raport_POST_saveFailure = function (req, res, next) {
  if (req.body.failureId) {
    var id = req.body.failureId
    delete req.body.failureId
    req.body.author = req.verifiedId
    failure.findByIdAndUpdate(id, req.body).exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.status(200).json(result)
    })
    return
  }

  if (!req.body.failureId) {
    delete req.body.failureId
    req.body.author = req.verifiedId
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
//FETCH RAPORT ENDS HERE
exports.raport_POST_update = function (req, res) {
  res.send('update raport POST NI')
}

exports.raport_GET_myRaport = function (req, res, next) {
  if (req.verifiedShift != 0) {
    Raport.findById(req.verifiedMyRaportId)
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
        populate: 'operation',
      })
      .populate({
        path: 'failure',
        populate: 'deviceType',
      })
      .populate({
        path: 'failure',
        populate: 'device',
      })
      .populate({
        path: 'failure',
        populate: 'collaborators',
      })
      .populate({
        path: 'failure',
        populate: 'author',
      })
      .exec(function (err, result) {
        if (err) {
          return next(err)
        }
        res.render('raport-detail', {
          raport: result,
          permission: req.verifiedPerm,
        })
      })
  }
  if (req.verifiedShift == 0) {
    if (req.verifiedPerm == 'admin' || req.verifiedPerm == 'specjalista') {
      res.render('redirect-access-denied', {
        title: 'Edytuj wybrany raport przez kalendarz',
        url: '/api/raporty',
      })
    }
    if (req.verifiedPerm == 'technik') {
      res.render('redirect-access-denied', {
        title:
          'Brak możliwości edycji - Nie zostałeś dodany do żadnej dzisiejszej zmiany',
        url: '/api/raporty',
      })
    }
  }
}

exports.raport_GET_one = function (req, res) {
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
      populate: 'operation',
    })
    .populate({
      path: 'failure',
      populate: 'deviceType',
    })
    .populate({
      path: 'failure',
      populate: 'device',
    })
    .populate({
      path: 'failure',
      populate: 'collaborators',
    })
    .populate({
      path: 'failure',
      populate: 'author',
    })
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('raport-detail', {
        raport: result,
        permission: req.verifiedPerm,
      })
    })
}

exports.raport_GET_firstSection = function (req, res, next) {
  if (req.verifiedShift != 0) {
    Raport.findById(req.verifiedMyRaportId)
      .populate('teamPresent')
      .populate('teamAbsent')
      .exec(function (err, result) {
        var roundAroundPlaces = [
          ['kettle', 'isKettle', 'Kotłownia'],
          ['compressor', 'isCompressor', 'Kompresownia'],
          ['ice', 'isIce', 'Wieża Chłodu'],
          ['electric', 'isElectric', 'Rozdzielnia'],
          ['workshop', 'isWorkshop', 'Warsztat'],
        ]
        if (err) {
          return next(err)
        }
        res.render('raport-first-section', {
          title: 'Podstawowe informacje',
          raportId: req.verifiedMyRaportId,
          absent: result.teamAbsent,
          present: result.teamPresent,
          roundAroundPlaces: roundAroundPlaces,
          roundAround: result.roundAround,
          additionalInfo: result.additionalInfo,
        })
      })
  }
  if (req.verifiedShift == 0) {
    console.log(req.verifiedPerm)
    if (req.verifiedPerm == 'admin' || req.verifiedPerm == 'specjalista') {
      res.render('redirect-access-denied', {
        title: 'Edytuj wybrany raport przez kalendarz',
        url: '/api/raporty',
      })
    }
    if (req.verifiedPerm == 'technik') {
      res.render('redirect-access-denied', {
        title:
          'Brak możliwości edycji - Nie zostałeś dodany do żadnej dzisiejszej zmiany',
        url: '/api/raporty',
      })
    }
  }
}
