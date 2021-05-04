const User = require('../models/user')
const { body, validationResult, cookie } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const Raport = require('../models/raport')

dotenv.config();
exports.user_GET_all = function (req, res) {
  User.find()
    .sort([['surname', 'ascending']])
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('user-list', {
        title: 'Lista Użytkowników',
        user_list: result,
      })
    })
}

exports.user_GET_add = function (req, res) {
  res.render('user-add', {
    title: 'Dodaj użytkownika',
    permission: ['technik', 'specjalista', 'admin'],
    position: ['specjalista', 'mechanik', 'robotyk', 'automatyk', 'kierownik'],
  })
}

exports.user_POST_add = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Podaj imię'),

  body('surname')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Podaj Nazwisko'),

  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),

  body('login').custom((value) => {
    return User.findOne({ login: value }).then((line) => {
      if (line) {
        return Promise.reject('Login: ' + value + ' jest już w użyciu')
      }
    })
  }),
  async function (req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('user-add', {
        title: 'Dodaj użytkownika',
        errors: errors.array(),
        permission: ['technik', 'specjalista', 'admin'],
        position: [
          'specjalista',
          'mechanik',
          'robotyk',
          'automatyk',
          'kierownik',
        ],
      })
      return
    } else {
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(req.body.password, salt)
      const user = new User({
        login: req.body.login,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        isAvaible: true,
        isEmployed: true,
        permission: req.body.permission,
        position: req.body.position,
        password: hashPassword,
      })
      user.save(function (err) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/uzytkownicy')
      })
    }
  },
]

exports.user_GET_update = function (req, res) {
  User.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    res.render('user-add', {
      title: 'Edytuj Użytkownika',
      user: result,
      permission: ['technik', 'specjalista', 'admin'],
      position: [
        'specjalista',
        'mechanik',
        'robotyk',
        'automatyk',
        'kierownik',
      ],
    })
  })
}

exports.user_POST_update = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Podaj imię'),

  body('surname')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Podaj Nazwisko'),

  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),

  async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      User.find()
      .sort([['surname', 'ascending']])
      .exec(function (err, result) {
        if (err) {
          return next(err)
        }
        console.log(errors.array())
      res.render('user-list', { title: 'Użytkownik', user_list: result, errors: errors.array() })
      })
    } else {
      User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        isAvaible: !!req.body.isAvaible,
        isEmployed: !!req.body.isEmployed,
        permission: req.body.permission,
        position: req.body.position,
      }).exec(function (err, result) {
        if (err) {
          return next(err)
        }
        res.redirect('/api/uzytkownicy/' + req.params.id)
      })
    }
  },
]

exports.user_GET_delete = function (req, res, next) {
  User.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    if (result == null) {
      // No results.
      res.redirect('/api/uzytkownicy/')
    }
    res.render('user-delete', {
      title: 'Usuń Użytkownika',
      user: result,
    })
  })
}

// Handle device delete on POST.
exports.user_POST_delete = function (req, res, next) {
  User.findByIdAndRemove(req.body.userid, function (err) {
    if (err) {
      return next(err)
    }
    // Success - go to author list
    res.redirect('/api/uzytkownicy')
  })
}

exports.user_GET_one = function (req, res, next) {
  User.findById(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    res.render('user-detail', { title: 'Użytkownik', user: result })
  })
}

/// SHIFT MANAGMENT ///

exports.user_GET_shift = function (req, res, next) {
  User.find({ isEmployed: true, isAvaible: true })
    .select({ _id: 1, name: 1, surname: 1, shift: 1, position: 1, permission: 1 })
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      const shift1 = result.filter((object) => object.shift == 1)
      const shift2 = result.filter((object) => object.shift == 2)
      const shift3 = result.filter((object) => object.shift == 3)
      const shift0 = result.filter((object) => object.permission == 'technik')
      res.render('user-shifts', {
        title: 'Zarządzanie zmianami',
        shift0: shift0,
        shift1: shift1,
        shift2: shift2,
        shift3: shift3,
      })
    })
}

exports.user_POST_shift = function (req, res) {
  var changeList = req.body
  var shift = req.body.shift
  User.updateMany({shift: shift}, {shift: 0})
  .exec(function (err, result) {
    if (err) {
      res.status(500).json({ error: err })
    }
    for (const [key, value] of Object.entries(changeList)) {
      if (value != shift) {
        User.updateOne(
          { _id: value },
          {
            $set: { shift: shift },
          }
        ).exec(function (err, result) {
          if (err) {
            res.status(500).json({ error: err })
          }
        })
      }
    }
    res.status(200).json({ body: 'Zapisano pomyślnie zmianę ' })
  })

}

/// LOGIN MANAGMENT
exports.user_GET_login = function(req, res) {
  res.clearCookie('token')
  res.render('login', {title: 'System Raportowania UR Spawalnia'});
}
exports.user_POST_login = async function(req, res, next) {
    User.findOne({login: req.body.login})
    .exec(async function(err, loggedInResult) {
        if(err) {
            return next(err)
        }
        if(!loggedInResult) {
            res.status(400).render('login', {errs:'Podany login nie widnieje w bazie danych'})
            return
        }
        const validPass = await bcrypt.compare(req.body.password, loggedInResult.password)
        if(!validPass) {
            res.status(400).render('login',{errs:'Złe hasło!'})
            return
        }

        //checking if raports exists for taday and loggedinshift- if not creates one
        if(loggedInResult.shift!=0) {
          const shiftLoggedIn = loggedInResult.shift
          var nowDate = new Date()

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
                // searching for the same day between 8 - 24
                $gte: startDate,
                $lte: endDate,
              },
            })
            .exec(function (err, resultRap) {
              if (err) {
                return next(err)
              }
              if (resultRap == null) {
                User.find({
                  shift: shiftLoggedIn,
                  isAvaible: true,
                })
                .exec(function (err, team) {
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
                  const token = jwt.sign({_id: loggedInResult._id, permission: loggedInResult.permission, myRaportId: raport._id,}, process.env.TOKEN_SECRET)
                  res.status(200)
                  .cookie('token', token, {
                    secure: true,
                  })
                  .redirect('/api/raporty')
                })
              } 
              if(resultRap){
                const token = jwt.sign({_id: loggedInResult._id, permission: loggedInResult.permission, myRaportId: resultRap._id}, process.env.TOKEN_SECRET)
                res.status(200)
                .cookie('token', token, {
                  secure: true,
                })
                .redirect('/api/raporty')
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
                // searching for the previous date 8 - 24
                $gte: startDate,
                $lte: nowDate,
              },
            })
            .exec(function (err, resultRap) {
              if (err) {
                return next(err)
              }
              if (resultRap == null) {
                User.find({
                  shift: shiftLoggedIn,
                  isAvaible: true,
                })
                .exec(function (err, team) {
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
                  const token = jwt.sign({_id: loggedInResult._id, permission: loggedInResult.permission, myRaportId: raport._id}, process.env.TOKEN_SECRET)
                  res.status(200)
                  .cookie('token', token, {
                    secure: true,
                  })
                  .redirect('/api/raporty')
                })
              } 
              if(resultRap){
                const token = jwt.sign({_id: loggedInResult._id, permission: loggedInResult.permission, myRaportId: resultRap._id}, process.env.TOKEN_SECRET)
                res.status(200)
                .cookie('token', token, {
                  secure: true,
                })
                .redirect('/api/raporty')
              }
            })
          }

        }
        if(loggedInResult.shift == 0) {
          const token = jwt.sign({_id: loggedInResult._id, permission: loggedInResult.permission, shift: 0}, process.env.TOKEN_SECRET)
          res.status(200)
          .cookie('token', token, {
            secure: true,
          })
          .redirect('/api/raporty')
        }

    })
}


