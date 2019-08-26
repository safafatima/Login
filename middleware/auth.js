const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log("authenticating!")
    try{
        console.log(req.header.Authorization)
        const Token = req.header('Authorization').replace('Bearer ','')
        console.log('token saved')
        const decoded = jwt.verify(Token,'secretkey')
        console.log(decoded)
        const user = await User.findOne({
            _id:decoded._id,
            'Tokens.token': Token})

        if(!user){
            throw new Error()
        }

        req.token = Token
        req.user = user
        next()
    }catch(e){
        res.status(401).send({Error: 'Please authenticate.'});
    }
}

module.exports = auth