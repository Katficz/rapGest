const DeviceType = require('../../models/device-type');
const {body, validationResult} = require('express-validator')
const async = require('async')
// dodać pug device-type-list
// device-type-add
// device-type-update
//device-type-deatail
exports.deviceType_GET_all = function(req, res) {
        DeviceType.find().sort({ name: 1 }).exec(function(err, result) {
            if(err) {
                return next(err)
            }
            res.render('device-type-list', { title: 'Lista Typów Urządzeń', list: result})
        })
};

exports.deviceType_GET_add = function(req, res) {
        res.render('device-type-add', {title: 'Dodaj Typ Urządzenia'})
    }


exports.deviceType_POST_add = [
    body('name')
    .trim()
    .isLength({ min: 1})
    .escape().withMessage('Wypełnij pole Nazwa')
    .withMessage('nieznany znakw polu Nazwa'),

    body('freeText')
    .trim().optional({ checkFalsy: true }),

    body('name').custom((value) => {
        return DeviceType.findOne({ name: value }).then((line) => {
           if (line) {
              return Promise.reject('Urządzenie ' + value + ' już istnieje')
           }
        })
     }),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('device-type-add', {title: 'Dodaj typ urządzenia', errors: errors.array()})
            return
        }
        else {
            
        const deviceType = new DeviceType({
            name: req.body.name,
            description: req.body.freeText
        })
        deviceType.save(function(err) {
            if (err) {
                return next(err)
            }
            res.redirect('/api/typy-urzadzen')
        })}
    }];

exports.deviceType_GET_update = function(req, res) {
    DeviceType.findById(req.params.id).exec(function(err, result) {
        if(err) {
            return next(err)
        }
        res.render('device-type-update', { title: 'Edytuj typ urzadzenia', result: result})
    })
};

exports.deviceType_POST_update = [
    body('name')
    .trim()
    .isLength({ min: 1})
    .escape().withMessage('Wypełnij pole Nazwa')
    .withMessage('nieznany znak w polu Nazwa'),

    body('freeText')
    .trim().optional({ checkFalsy: true }),

     (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        DeviceType.findById(req.params.id).exec(function(err, result) {
            if(err) {
                return next(err)
            }
            res.render('device-type-update', { title: 'Edytuj typ urzadzenia',errors: errors.array(), result: result})
            return
        })}

        else {
            DeviceType.findByIdAndUpdate(req.params.id, {
                name: req.body.name,
                description: req.body.freeText,
            }).exec(function(err, result) {
                if(err) {
                    return next(err)
                }
                res.redirect('/api/typy-urzadzen/' + req.params.id)
            })}
     }];

exports.deviceType_GET_DELETE = function(req, res) {
    deviceType.findByIdAndRemove(req.params.id).exec(function (err, result) {
        if(err) {
            return next(err)
        }
        res.redirect('/api/typy-urzadzen')
    })
};

exports.deviceType_GET_one = function(req, res) {
    DeviceType.findById(req.params.id).exec(function (err, result) {
        if(err) {
            return next(err)
        }
        if (result == null) {
            let err = new Error('Nie znaleziono takiej linii')
            err.status(404)
            return next(err)
         }
        res.render('device-type-detail', {title: 'Typ Urządzenia', result: result})
    })
};