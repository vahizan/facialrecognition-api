const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
const image = require('./controllers/image');
const profile = require('./controllers/profile');
const login = require('./controllers/login');
const register = require('./controllers/register');
const Clarifai = require("clarifai");

const clarifaiApp = new Clarifai.App({
 apiKey: 'd055746d4fcd4ab18e84046fcede4474'
});

const saltRounds = 10;

var knex = require('knex');
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'vahizanvijayanathan',
    password : '',
    database : 'facial-recognition'
  }
});

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,response)=>{db('users').then(userData => response.json(userData))});
app.listen(process.env.PORT || 3000,()=>{console.log(`App is running on port ${process.env.PORT}`)});
app.post('/login', login.checkUser(db,bcrypt));
app.post('/register', register.registerUser(db,bcrypt)());
app.post('/imageurl', image.imageData(clarifaiApp));
app.get('/profile/:id', profile.findUser(db));
app.put('/image',image.updateEntries(db));

//API DESIGN

/*
res -- this is working
/login -> POST: success or fail
/register -> POST = user
/profile/:userId -> GET = user
/image -> PUT --> updated userObject

*/