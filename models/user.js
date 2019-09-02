const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim:true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!(validator.isEmail(value))){
                throw new Error("Invalid email")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(value.length<6){
                throw new Error('Password should be of 6 characters or more.')
            }
            if(value.includes('password'))
            {
                throw new Error('Password can not contain the word password.')
            }
        },
        trim: true 
    },
    resetString:{
        type: String
    },
    
    accessTokens:[
        {accessToken: {
            type: String, 
            // required: true
        }}
    ],
    refreshTokens:[
        {refreshToken: {
            type: String, 
            // required: true
        }}
    ]
});


//Create public profile
userSchema.methods.toJSON = function (){
    const user = this

    const userObject = user.toObject()
    // delete userObject.Password
    // delete userObject.Tokens
    return userObject
}

// Save user
// Hash plain-text password before saving
userSchema.pre('save', async function (next){
    const user = this;

    console.log('In the save function now....')
    if(user.isModified('Password')){
        console.log('Hashing Password')
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

//Search user by Email
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user)
        throw new Error('Unable to login, user not found.')
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) //verify password
    {
        console.log('Passwords dont match')
        throw new Error('Incorrect Password!')}
   
    return user;
}

//Generate token for user
userSchema.methods.generateAuthToken = async function (){
    const user = this
    console.log('generating auth token')
    const accessToken = jwt.sign({_id: user._id.toString()},'secretkey', {expiresIn: '20s'})
    const refreshToken = jwt.sign({_id: user._id.toString()},'secretkey', {expiresIn: '300s'})
    user.accessTokens = user.accessTokens.concat({accessToken}) 
    user.refreshTokens = user.refreshTokens.concat({refreshToken})
    await user.save()
    return {accessToken, refreshToken}
}

const User = mongoose.model('User', userSchema);
module.exports = User