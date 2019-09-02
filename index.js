const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./router/auth');
const userRoutes = require('./router/user');

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

//set up routes
app.use(authRoutes);
app.use(userRoutes);

//listen on available port
app.listen( PORT, () => {
    console.log('App listening on port ' + PORT)
})