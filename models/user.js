const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim:true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!(validator.isEmail(value))){
                console.error(new Error('Invalid email.'))
                throw new Error("Invalid email!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            let validPassword = true

            if(value.length<6){
                validPassword = false
            }else if(value.includes('password'))
            {
                validPassword = false
                
            }else{
                var pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
                validPassword = pattern.test(value)
            }
            
            if(validPassword){
                console.log("Valid password");
            }else{
                console.error(new Error('Invalid Password.'))
                throw new Error('Password does not meet the minimum requirements.')
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
userSchema.pre('save', async function (next){
    const user = this;

    console.log('In the save function now....')
    if(user.isModified('Password')){
        console.log('Hashing Password')
        user.password = await bcrypt.hash(user.password, 8)             // Hash plain-text password before saving
    }
    next();
})

//Search user by Email
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        console.error(new Error('User not found'))
        throw new Error('Unable to login, user not found.')}
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) //verify password
    {
        console.error(new Error('Passwords dont match.'))
        throw new Error('Invalid credentials!')}
   
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