const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
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

const storeLoginDetails = (email,pass) => (saltRounds) => (dbFunc) => {
	if(!saltRounds){
		saltRounds = 10;
	}
	bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(pass, salt, function(err, hash) {
        // Store hash in your password DB.
        if(hash && dbFunc){
        	dbFunc(email,hash);
        }
    });
	});
}
//using composing to find user then execute http response
const findUser = (users, id) => {
	users.forEach((user)=>{
		if(id === user.id){
			return user;
		}
		return {};
	});
} 
const respondWithObj = (resp,value)=>{
	return resp.json(value);
}

app.get('/',(req,response)=>{
	//response.send(db.users);
	db('users').then(userData => response.json(userData));
});

app.listen(3000,()=>{
	console.log("App is running on port 3000");
});

app.post('/login', (req,response) =>{
	const {email,password} = req.body;
	db('login')
	.where('email',email)
	.then(loginDetails => {
		bcrypt.compare(password, loginDetails[0].hash).then(res => {
			return (res) ? db('users').where('email',email)
			.then(data => response.json(data[0]))
			.catch(err => response.status(404).json("success"))
			: response.status(404).json("Incorrect Login Details");
			
		});
	})
});

app.post('/register', (req,response) =>{
	const {name,email,password,phone} = req.body; 
	db('users')
	.returning('*')
	.insert({
		name,
		email,
		phone,
		joined: new Date()
	})
	.then(data => response.json(data[0]))
	.catch(err => response.status(404).json("Unable to Register. Please Try Again"));
	
	//create + store password hash
	storeLoginDetails(email,password)()((email,hash) => {db('login').insert({email,hash})});
});

const validUser = (users) =>(email,pass) => {
		let userFound = {};
		users.some((user)=>{
			if(user.email === email && user.pass === pass){
				userFound = user;
				return true;
			}
			return false;
		});
		return userFound;}

const checkUser = (users,id) => (resp) => (foundFn,notFoundFn) =>{
	let found = false;
	users.forEach((user)=>{
		if(id == user.id){
			found = true;
			return foundFn(resp,user);
		}
	});
	if(!found){
		return notFoundFn(resp);
	}} 

const incImageEntries = (resp,user) =>{
	user.entries++;
	return resp.json(user.entries);}
const foundUser = (resp,user) =>{return resp.json(user);}
const userNotFound = (resp) =>{return resp.status(404).json("User Not Found");}

app.get('/profile/:id', (req,resp)=> {
	const {id} =  req.params;
	db('users')
	.where('id',id)
	.then( user => (user.length) ? resp.json(user[0]) : resp.status(404).json('User Not Found'))
	.catch(err => resp.status(404).json("Cannot Process Request"));
	
});

app.put('/image',(req,resp)=>{
	const {id} = req.body;
	db('users')
	.returning('entries')
	.where('id','=',id)
	.increment('entries', 1)
	.then(entries => (entries.length) ? resp.json(entries[0]) : resp.status(404).json("Cannot Process Request"))
	.catch(err => resp.status(404).json("Cannot Process Request") );
});

//API DESIGN

/*
res -- this is working
/login -> POST: success or fail
/register -> POST = user
/profile/:userId -> GET = user
/image -> PUT --> updated userObject

*/