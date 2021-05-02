const jwt = require('jsonwebtoken')
// adds verifiedId with logged in user ID and verifiedPerm with logged users permision in req



exports.authTech = function(req, res, next) {
    const token = req.cookies.token
    if(!token) return res.status(401).send('Access Denied')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.verifiedId = verified._id
        req.verifiedPerm = verified.permission
        req.verifiedMyRaportId = verified.myRaportId
        req.verifiedShift = verified.shift
        return next()
    } 
    catch (error) {
        res.status(400).send('Invalid Token')
    }
}

exports.authSpec = function(req, res, next) {
    const token = req.cookies.token
    if(!token) return res.status(401).send('Access Denied')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        if(verified.permission == 'specjalista' || verified.permission == 'admin') {
            req.verifiedId = verified._id
            req.verifiedPerm = verified.permission
            req.verifiedShift = verified.shift
            return next()
        }
        else {
            return res.status(401).send('Access Denied')
        }
    } 
    catch (error) {
        return res.status(400).send('Invalid Token')
    }
}

exports.authAdmin = function(req, res, next) {
    const token = req.cookies.token
    if(!token) return res.status(401).send('Access Denied')
    
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        if(verified.permission == 'admin') {
            req.verifiedId = verified._id
            req.verifiedPerm = verified.permission
            req.verifiedShift = verified.shift

            return next()
        }
        else {
            return res.status(401).send('Access Denied')
        }
    } 
    catch (error) {
        return res.status(400).send('Invalid Token')
    }
}