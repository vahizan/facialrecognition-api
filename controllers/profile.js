const findUser = (db) => (req,resp)=> {
	const {id} =  req.params;
	db('users')
	.where('id',id)
	.then( user => (user.length) ? resp.json(user[0]) : resp.status(404).json('User Not Found'))
	.catch(err => resp.status(404).json("Cannot Process Request"));
}

module.exports = {
	findUser: findUser
}