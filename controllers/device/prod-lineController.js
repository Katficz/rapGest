const ProdLine = require('../../models/prod-line');
const {body, validationResult} = require('express-validator')
const async = require('async')

exports.prodLine_GET_all = function(req, res) {
        ProdLine.find().sort({ name: 1 }).exec(function(err, result) {
            if(err) {
                return next(err)
            }
            res.render('prod-line-list-display', { title: 'Lista Linii Produkcyjnych', list: result})
        })
};

exports.prodLine_GET_add = function(req, res) {
        res.render('prod-line-add.pug', {title: 'Dodaj linie Prod'})
    }


exports.prodLine_POST_add = [
    body('name')
    .trim()
    .isLength({ min: 1})
    .escape().withMessage('Wypełnij pole Nazwa')
    .withMessage('nieznany znakw polu Nazwa'),

    body('freeText')
    .trim().optional({ checkFalsy: true }),

    body('name').custom((value) => {
        return ProdLine.findOne({ name: value }).then((line) => {
           if (line) {
              return Promise.reject('Linia ' + value + ' już istnieje')
           }
        })
     }),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('prod-line-add', {title: 'Dodaj linie Prod', errors: errors.array()})
            return
        }
        else {
            
        const prodLine = new ProdLine({
            name: req.body.name,
            description: req.body.freeText
        })
        prodLine.save(function(err) {
            if (err) {
                return next(err)
            }
            res.redirect('/api/linie-produkcyjne')
        })}
    }];

exports.prodLine_GET_update = function(req, res) {
    ProdLine.findById(req.params.id).exec(function(err, result) {
        if(err) {
            return next(err)
        }
        res.render('prod-line-update', { title: 'Edytuj linię produkcyjną', result: result})
    })
};

exports.prodLine_POST_update = [
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
        ProdLine.findById(req.params.id).exec(function(err, result) {
            if(err) {
                return next(err)
            }
            res.render('prod-line-update', { title: 'Edytuj linię produkcyjną',errors: errors.array(), result: result})
            return
        })}

        else {
            ProdLine.findByIdAndUpdate(req.params.id, {
                name: req.body.name,
                description: req.body.freeText,
            }).exec(function(err, result) {
                if(err) {
                    return next(err)
                }
                res.redirect('/api/linie-produkcyjne/' + req.params.id)
            })}
     }];

exports.prodLine_GET_delete = function(req, res) {
    ProdLine.findByIdAndRemove(req.params.id).exec(function (err, result) {
        if(err) {
            return next(err)
        }
        res.redirect('/api/linie-produkcyjne')
    })
};

exports.prodLine_GET_one = function(req, res) {
    ProdLine.findById(req.params.id).exec(function (err, result) {
        if(err) {
            return next(err)
        }
        if (result == null) {
            return next(err)
         }
        res.render('prod-line-detail', {title: 'Linia', result: result})
    })
};