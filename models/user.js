const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    Email:{
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
    Password:{
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
    }
    ,
    Tokens:[
        {token: {
            type: String, 
            required: true
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

//Hash plain-text password before saving
userSchema.pre('save', async function (next){
    const user = this;

    console.log('In the save function now....')
    if(user.isModified('Password')){
        console.log('in hashing condition')
        user.Password = await bcrypt.hash(user.Password, 8)
    }
    next();
})

//Search user by Email
userSchema.statics.findByCredentials = async (Email, Password) =>{
    const user = await User.findOne({Email})
    if(!user)
        throw new Error('Unable to login, user not found.')
    
    const isMatch = await bcrypt.compare(Password, user.Password)
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
    const token = jwt.sign({_id: user._id.toString()},'secretkey')   
    user.Tokens = user.Tokens.concat({token}) 
    await user.save()
    return token
}

const User = mongoose.model('User', userSchema);
module.exports = User