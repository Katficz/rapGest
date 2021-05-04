const jwt = require('jsonwebtoken')
// adds verifiedId with logged in user ID and verifiedPerm with logged users permision in req



exports.authTech = function(req, res, next) {
    const token = req.cookies.token
    if(!token) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest nieplawidłowy!'})
        return
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.verifiedId = verified._id
        req.verifiedPerm = verified.permission
        req.verifiedMyRaportId = verified.myRaportId
        req.verifiedShift = verified.shift
        return next()
    } 
    catch (error) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest', url: '/api/raporty'})
    }
}

exports.authSpec = function(req, res, next) {
    const token = req.cookies.token
    if(!token) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest nieplawidłowy!'})
        return
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        if(verified.permission == 'specjalista' || verified.permission == 'admin') {
            req.verifiedId = verified._id
            req.verifiedPerm = verified.permission
            req.verifiedShift = verified.shift
            return next()
        }
        else {
            res.status(401).render('redirect-access-denied', {title:'Nie posiadasz wystarczającego stopnia dostępu do tego zasobu!'})
        }
    } 
    catch (error) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest nieplawidłowy.', url: '/api/raporty'})
    }
}

exports.authAdmin = function(req, res, next) {
    const token = req.cookies.token
    if(!token) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest nieplawidłowy!'})
        return
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        if(verified.permission == 'admin') {
            req.verifiedId = verified._id
            req.verifiedPerm = verified.permission
            req.verifiedShift = verified.shift

            return next()
        }
        else {
            res.status(401).render('redirect-access-denied', {title:'Nie posiadasz wystarczającego stopnia dostępu do tego zasobu!'})
        }
    } 
    catch (error) {
        res.status(400).render('redirect-access-denied', {title:'Coś poszło nie tak... Twój token jest nieplawidłowy!'})
    }
}