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
  startDate.setHours(startDate.getHours() + 2)
  startDate.setUTCDate(startDate.getUTCDate() - 4)
  async.parallel(
    {
      shiftA: function (callback) {
        Raport.find({
          shift: 1,
          date: {
            $gte: startDate,
          },
          isCurrent: true,
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
          isCurrent: true,
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
          isCurrent: true,
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

      for (var i = 0; i < 4; i++) {
        startDate.setUTCDate(startDate.getUTCDate() + 1)
        day = startDate.getUTCDate()
        month = startDate.getUTCMonth()+1
        year = startDate.getUTCFullYear()
        if(day<10) day = '0'+day
        if(month<10) month = '0'+month
        dates.push(day+'.'+month+'.'+year)
        //dates.push(DateTime.fromJSDate(startDate).toFormat('dd.LL.yyyy'))
        day = 0
        month = 0
        year = 0
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
        permission: req.verifiedPerm
      })
    }
  )
}
//will get rid of this
// exports.raport_GET_update = function (req, res, next) {
//   async.parallel(
//     {
//       raport: function (callback) {
//         Raport.findById(req.params.id)
//           .populate('teamPresent')
//           .populate('teamAbsent')
//           .populate({
//             path: 'failure',
//             populate: {
//               path: 'prodLine',
//               model: 'ProdLine',
//             },
//           })
//           .populate({
//             path: 'failure',
//             populate: 'deviceType',
//           })
//           .populate({
//             path: 'failure',
//             populate: 'device',
//           })
//           .populate({
//             path: 'failure',
//             populate: 'author',
//           })
//           .populate({
//             path: 'failure',
//             populate: 'operation',
//           })
//           .exec(callback)
//       },
//       deviceTypes: function (callback) {
//         DeviceType.find()
//           .sort([['name', 'ascending']])
//           .exec(callback)
//       },
//       prodLines: function (callback) {
//         ProdLine.find()
//           .sort([['name', 'ascending']])
//           .exec(callback)
//       },
//       operations: function (callback) {
//         Operation.find()
//           .sort([['name', 'ascending']])
//           .exec(callback)
//       },
//       devices: function (callback) {
//         Device.find()
//           .sort([['name', 'ascending']])
//           .exec(callback)
//       },
//     },
//     function (err, result) {
//       if (err) {
//         return next(err)
//       }

//       var roundAroundPlaces = [
//         ['kettle', 'isKettle', 'Kotłownia'],
//         ['compressor', 'isCompressor', 'Kompresownia'],
//         ['ice', 'isIce', 'Wieża Chłodu'],
//         ['electric', 'isElectric', 'Rozdzielnia'],
//         ['workshop', 'isWorkshop', 'Warsztat'],
//       ]
//       var canUpdate = true
//       if (req.verifiedPerm == 'technik') canUpdate = false
//       res.render('raport-update', {
//         title:
//           'Edytuj Raport zmiany ' +
//           result.raport.shift +
//           ' z dnia ' +
//           result.raport.virtual_date,
//         data: result,
//         absent: result.raport.teamAbsent,
//         present: result.raport.teamPresent,
//         roundAroundPlaces: roundAroundPlaces,
//       })
//     }
//   )
// }

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
              populate: 'operation',
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
    if(!req.params.id) {
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
      return
    }
    if(req.params.id) {
      async.parallel(
        {
          specialists: function (callback) {
            User.find({
              permission: 'specjalista',
              isAvaible: true,
            }).exec(callback)
          },
          raport: function (callback) {
            Raport.findById(req.params.id)
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
                populate: 'operation',
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
  }
}
// get only for first section
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
    if(!req.params.id){
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
      return
    }
    if(req.params.id) {
      Raport.findById(req.params.id)
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
          console.log(err)
          res.status(500).json({err:err})
          return
        }
        res.render('raport-first-section', {
          title: 'Podstawowe informacje',
          raportId: result._id,
          absent: result.teamAbsent,
          present: result.teamPresent,
          roundAroundPlaces: roundAroundPlaces,
          roundAround: result.roundAround,
          additionalInfo: result.additionalInfo,
          date: result.virtual_date,
          shift: result.shift
        })
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
    console.log(req.body.failureId)
    delete req.body.failureId
    rapId = req.params.id

    failure.findByIdAndUpdate(id, req.body)
    .exec(function (err, result) {
      if (err) {
        console.log(err)
        res.status(500).json({err:err})
        return
      }
      req.body.isCurrent = false
      req.body.author = result.author
      outDatedFailure = new Failure(req.body)
      outDatedFailure.save(function(err) {
        if(err) {
          console.log(err)
          res.status(500).json({err:err})
          return
        }
        Raport.findById(rapId)
        .exec(function(err, foundRaport) {
          if(err) {
            console.log(err)
            res.status(500).json({err:err})
            return
          }
          oldFailures = foundRaport.failure

          var index = oldFailures.indexOf(id)
          oldFailures[index] = outDatedFailure._id

          outDatedRaport = new Raport({
            date: foundRaport.date,
            teamPresent: foundRaport.teamPresent,
            teamAbsent: foundRaport.teamAbsent,
            shift: foundRaport.shift,
            roundAround: foundRaport.roundAround,
            failure: oldFailures,
            additionalInfo: foundRaport.additionalInfo,
            isCurrent: false,
            savedBy: req.verifiedId,
            editedDate: new Date()
          })

          outDatedRaport.save(function(err) {
            if(err) {
              console.log(err)
              res.status(500).json({err:err})
              return
            }
            res.status(200).json(result)
          })
        })
      })
    })
    return
  }

  if (!req.body.failureId) {
    delete req.body.failureId
    req.body.author = req.verifiedId
    req.body.isCurrent = true
    const failure = new Failure(req.body)
    failure.save(function (err) {
      if(err) {
        console.log(err)
        res.status(500).json({err:err})
        return
      }
        Raport.findByIdAndUpdate(req.params.id, {
          $push: { failure: failure._id, ref: 'Failure' },
        }).exec(function (err) {
          if (err) {
            return next(err)
          }
          Raport.findById(req.params.id)
          .exec(function(err, result) {
            if(err) {
              console.log(err)
              res.status(500).json({err:err})
              return
            }
            outDatedRaport = new Raport({
              date: result.date,
              teamPresent: result.teamPresent,
              teamAbsent: result.teamAbsent,
              shift: result.shift,
              roundAround: result.roundAround,
              failure: result.failure,
              additionalInfo: result.additionalInfo,
              isCurrent: false,
              savedBy: req.verifiedId,
              editedDate: new Date()
            })

            outDatedRaport.save(function(err) {
              if(err) {
                console.log(err)
                res.status(500).json({err:err})
                return
              }
              res.status(200).json(failure)
            })
          })
        })
    })
  }
}

exports.raport_POST_saveFirstSection = function(req, res, next) {
  savedById = req.verifiedId
  Raport.findByIdAndUpdate(req.params.id, req.body)
  .exec(function(err, result) {
    if(err) {
      res.status(500).json({erro: err})
      return
    }
    req.body.failure = result.failure
    req.body.date = result.date,
    req.body.shift = result.shift,
    req.body.isCurrent = false,
    req.body.savedBy = req.verifiedId,
    req.body.editedDate = new Date()

    var outDatedRaport = new Raport(req.body)
    outDatedRaport.save(function(err) {
      if(err) {
        res.status(500).json({err:err})
        return
      }
      res.status(200).json('success!')
    })
  })
}

//FETCH RAPORT ENDS HERE


exports.raport_GET_addNew = function (req, res) {

  var from = req.params.date.split("-")
  var creationDate = new Date(from[2], from[1] - 1, from[0],13,0,0)
  var startSearchingDate = new Date(from[2], from[1] - 1, from[0],8,0,0)
  var endSearchingDate = new Date(from[2], from[1] - 1, from[0],23,0,0)
  shift = req.params.shift

  Raport.findOne({
    date: {
      // searching for the same day between 8 - 24
      $gte: startSearchingDate,
      $lte: endSearchingDate,
    },
    shift: shift
  })
  .exec(function(err, result) {
    if(err) {
      res.status(500).json({err:err})
      return
    }
    if(result) {
      res.status(200).render('redirect-access-denied', {title: 'Raport dla danego dnia już istnieje!'})
      return
    }
    User.find({
      shift: shift,
      isAvaible: true,
    })
    .exec(function (err, team) {
      if (err) {
        res.status(500).json(err)
        return next(err)
      }
      raport = new Raport({
        date: creationDate,
        shift: shift,
        teamAbsent: team,
        teamPresent: [],
        isCurrent: true,
      })
      raport.save()
      res.status(200).redirect(raport.url)
    })
  })
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
    .populate('savedBy')
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
        console.log(err)
        res.status(500).json({err:err})
        return
      }
      if(result.editedDate) date = result.editedDate.toLocaleString()
      else date = undefined
      res.render('raport-detail', {
        raport: result,
        permission: req.verifiedPerm,
        editedDate: date,
      })
    })
}

// GET history of changes
exports.raport_GET_historyOfChanges = function(req, res, next) {
  currentRapId = req.params.id  
  Raport.findById(currentRapId)
  .exec(function(err, currentRap) {
    if(err){
      console.log(err)
      res.status(500).json({err:err})
      return
    }
    Raport.find({
      date: currentRap.date,
      shift: currentRap.shift,
      isCurrent: false
    })
    .populate('savedBy')
    .sort({ editedDate: -1 })
    .exec(function(err, result) {
      if(err){
        console.log(err)
        res.status(500).json({err:err})
        return
      }
      //console.log(result)
      niceRapList = []
      for(var i = 0;i<result.length;i++) {
        niceRapList.push([result[i].editedDate.toLocaleString(), result[i].savedBy.fullname, result[i]._id])
      }
      res.render('raport-history-of-changes', {raports: niceRapList, currentRaport: currentRap})
    })
  })
}


