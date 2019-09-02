const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authRefreshToken = async (req, res, next) => {
    console.log("----- authenticating refresh token -----")
    try{

        const email = req.body.email
        const refToken = req.body.refToken

        const decoded = jwt.verify(refToken,'secretkey')
        console.log(decoded)

        const user = await User.findOne({
            _id:decoded._id,
            'refreshTokens.refreshToken' : refToken})

        if(!user){
            console.log('no user')
            throw new Error()
        }
        console.log('user found' + user)
        req.user = user
        next()
    }catch(e){
        res.status(401).send({Error: 'Not authenticated.'});
    }
}


module.exports = authRefreshToken