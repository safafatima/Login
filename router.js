const express = require('express')
const router = new express.Router()
const User = require('./models/user');
const passport = require('passport')
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

//Homepage
router.get('/', (req, res) => {
    res.send('Hello there, please sign up or login to continue.')
})




// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
      }
    });
  }
});








//Sign up
router.post('/signup', async (req,res)=>{
    const user = new User(req.body);                      //validation included
    try{

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
        await user.save();                                  //hash and save
        const token = await user.generateAuthToken();
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
        res.send({user, token});
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/views/activateAccount', async (req, res) => {
    try{
        res.render('activateAccount')
    }catch(e)
    {
        res.status(400).send(e)
    }
})

//Logout
router.get('/logout' , async (req, res) => {
    try{
        req.logout()
    }catch(e){}
})

module.exports = router