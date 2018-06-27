const registerUser = (db,bcrypt) => (saltRounds) => (req,response) =>{
	const {name,email,password,phone} = req.body; 
	if(!name || !email || !password) {
		return response.status(404).json("Please Fill in All the Required Fields");
	}
	const saltNumber = (saltRounds) ? saltRounds: 10;
	var salt = bcrypt.genSaltSync(saltNumber);
	var hash = bcrypt.hashSync(password, salt);
	db.transaction(trx => {
		trx('login')
		.returning("email")
		.insert({
			hash,
			email,
		}).then(userEmail => {
			return trx('users')
			.returning("*")
			.insert({
				name,
				email,
				phone,
				joined: new Date()
			})
			.then(userDetails => response.json(userDetails[0]))
			.catch(err => response.status(404).json("Unable to Process Request"));
		})
		.then(trx.commit)
		.catch(trx.rollback)
	}).catch(err => response.status(404).json("Cannot Register User"));
}

module.exports = {
	registerUser: registerUser
}