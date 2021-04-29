const jwt = require('jsonwebtoken')

exports.authTech = function(req, res, next) {
    const token = req.cookies.token
    if(!token) return res.status(401).send('Access Denied')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.verifiedId = verified._id
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