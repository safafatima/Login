const express = require('express')
const router = new express.Router()
const User = require('./models/user');
const passport = require('passport')
var nodemailer = require('nodemailer');
const auth = require('./middleware/auth')
var sgTransport = require('nodemailer-sendgrid-transport');


//Homepage
router.get('/', (req, res) => {
    res.send('Hello there, please sign up or login to continue.')
})


//Sign up
router.post('/signup', async (req,res)=>{
    const user = new User(req.body);                      //validation included
    try{
        await user.save(); //saving includes hashing the password
        const token = await user.generateAuthToken();

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
          to: user.Email,
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
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }
});


//Login
router.post('/login', async (req,res) => {
  try{
      const user = await User.findByCredentials(req.body.Email, req.body.Password);
      const token = await user.generateAuthToken();
      res.send({user, token });
  }catch(e){
      res.status(400).send()
  }
})

//Read profile
router.get('/me', auth, async (req,res) => {
  res.send(req.user)
});

//Logout
router.post('/logout', auth, async (req,res) => {
  try{
      req.user.Tokens = req.user.Tokens.filter( token => token.token !== req.token)
      await req.user.save()
      res.send('Logged out!')
  }catch(e){
      req.status(500).send('Failed to log out.')
  }
})
module.exports = router