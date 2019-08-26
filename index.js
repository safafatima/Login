if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
  
const express = require('express')
const router = require('./router')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3000

//connect with db
mongoose.connect('mongodb://127.0.0.1:27017/users', {
    useNewUrlParser: true,
    useCreateIndex: true} , function(error) {
        if (error) throw error
        console.log('Successfully connected to database | port 27017')
    });

//set up middleware
app.use(express.json());

//inintialize passport
// app.use(passport.initialize())
// app.use(passport.session())

//set up routes
app.use(router)

//listen on available port
app.listen( PORT, () => {
    console.log('App listening on port ' + PORT)
})