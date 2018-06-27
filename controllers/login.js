const checkUser = (db,bcrypt) => (req,response) => {
	const {email,password} = req.body;
	db('login')
	.where('email',email)
	.then(loginDetails => {
		bcrypt.compare(password, loginDetails[0].hash).then(res => {
			db('users').where('email',email)
			.then(data => response.json(data[0]))	
		});
	}).catch(err => response.status(404).json("Incorrect Login Details"))
}

module.exports = {
	checkUser: checkUser
}