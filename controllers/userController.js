const User = require('../models/user')
const { body, validationResult } = require('express-validator')

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

  (req, res, next) => {
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
      const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        isAvaible: true,
        isEmployed: true,
        permission: req.body.permission,
        position: req.body.position,
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

  body('email').normalizeEmail().isEmail(),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('user-list', { title: 'Użytkownik', errors: errors.array() })
      return
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

exports.user_GET_delete = function (req, res) {
  User.findByIdAndRemove(req.params.id).exec(function (err, result) {
    if (err) {
      return next(err)
    }
    res.redirect('/api/uzytkownicy/')
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
    .select({ _id: 1, name: 1, surname: 1, shift: 1, position: 1 })
    .exec(function (err, result) {
      if (err) {
        console.log(err)
        return next(err)
      }
      const shift1 = result.filter((object) => object.shift == 1)
      const shift2 = result.filter((object) => object.shift == 2)
      const shift3 = result.filter((object) => object.shift == 3)
      res.render('user-shifts', {
        title: 'Zarządzanie zmianami',
        shift0: result,
        shift1: shift1,
        shift2: shift2,
        shift3: shift3,
      })
    })
}

exports.user_POST_shift = function (req, res) {
  var changeList = req.body
  var shift = req.body.shift

  User.updateMany({ shift: shift }, { shift: 0 }).exec(function (err, result) {
    if (err) {
      res.status(500).json({ error: err })
    }
  })

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
}
