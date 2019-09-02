const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log("authenticating!")
    try{
        const Token = req.header('Authorization').replace('Bearer ','')
        console.log('token saved')
        const decoded = jwt.verify(Token,'secretkey')
        console.log(decoded)

        const user = await User.findOne({
            _id:decoded._id,
            'accessTokens.accessToken': Token})

        if(!user){
            throw new Error()
        }

        // //Check for expiry of access token
        // var current_time = Date.now() / 1000;
        // console.log('Time right now --->   ' + current_time)
        // if ( decoded.exp - current_time < 10) {
        //     console.log('less than 10s remaining')
        //     user.AccessTokens.forEach( accessToken => {
        //         console.log( accessToken )
        //     })
        //         // { 'accessToken' : Token})
        //     console.log('current token -->')    
        //     console.log(currentAccessToken)
        //     //     currentAccessToken.exp += 10
        // }

        req.token = Token
        req.user = user
        next()
    }catch(e){
        res.status(401).send({Error: 'Not authenticated.'});
    }
}

module.exports = auth