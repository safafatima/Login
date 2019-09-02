const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const nodemailer = require('nodemailer')
const auth = require('../middleware/auth')
const sgTransport = require('nodemailer-sendgrid-transport')
const authRefreshToken = require('../middleware/authRefreshToken')


//Sign up
router.post('/auth/signup', async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save(); //saving includes hashing the password
        const {accessToken, refreshToken} = await user.generateAuthToken();
        console.log('access token ---> ' + accessToken + '\nrefresh token--->' + refreshToken)

        //Email API setup
        var options = {
          auth: {
              api_user: 'safajanjua',
              api_key: '12345qwerty'
            }
          }
    
          var client = nodemailer.createTransport(sgTransport(options));
    
          var email = {
          from: 'Test Sign Up, test@localhost.com',
          to: user.email,
          subject: 'Hello',
          text: 'Activate now',
          html: `<h3>Thankyou for signing up.</h3>
                  <p>Please click the link below to activate your account:</p>            
                  <b><a href='views/activateAccount.ejs'>Activation Link</a></b>`
          };
    
        //Email confirmation
        client.sendMail(email, function(err, info){
            if (err ){
            console.log(err);
            }
            else {
            console.log('Message sent: ' + info.response);
            }
        });
        res.status(201).send({user, accessToken, refreshToken});
    }catch(e){
        res.status(400).send(e);
    }
});


//Login
router.post('/auth/login', async (req,res) => {
  try{
      const user = await User.findByCredentials(req.body.email, req.body.password);
      const {accessToken, refreshToken} = await user.generateAuthToken();
      res.send({user, accessToken, refreshToken});
  }catch(e){
      res.status(400).send()
  }
})


//Refresh access token
router.post('/auth/refreshAccessToken', authRefreshToken, async (req, res) => {
  try{
    const {accessToken, refreshToken} = await req.user.generateAuthToken();
    res.send({accessToken});
  }catch(e){
    res.status(400).send(e)
  }
})


//Forgot password
router.post('/auth/forgotPassword', async (req, res) => {
  try{

    const ResetString = Math.random().toString(36).substring(7);
    console.log("Reset String ----->  ", ResetString);

      //Email API setup
      var options = {
        auth: {
            api_user: 'safajanjua',
            api_key: '12345qwerty'
          }
        }
  
        var client = nodemailer.createTransport(sgTransport(options));
  
        var email = {
        from: 'Test Sign Up, test@localhost.com',
        to: req.body.email,
        subject: 'Reset password',
        text: 'Reset your password.',
        html: `<p>Please click the link below to reset your account:</p>` + ResetString
        };
  
      //Email confirmation
      client.sendMail(email, function(err, info){
          if (err ){
          console.log(err);
          }
          else {
          console.log('Message sent: ' + info.response);
          }
      });
      res.send('Check email for reset link.')
      
  }catch(e){
      res.status(400).send(e);
  }
})

//Reset password
router.post('/auth/resetPassword', async (req, res) => {
  try{
    const user = await User.findOne({
      'email' : req.body.email,
      'resetString': req.body.resetString})
  
      user.password = req.body.newPassword
      await user.save()
      res.send('Password has been successfully reset.')

  }catch(e){
    res.send(e)
  }
})

//Logout
router.post('/auth/logout', auth, async (req,res) => {
  try{
    req.user.accessTokens = req.user.accessTokens.filter( accessToken => accessToken.accessToken !== req.token)
    await req.user.save()
    res.send('Logged out!')
}catch(e){
    req.status(500).send('Failed to log out.')
}
})


module.exports = router