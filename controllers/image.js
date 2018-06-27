const updateEntries = (db) => (req,resp) =>{
	const {id} = req.body;
	db('users')
	.returning('entries')
	.where('id','=',id)
	.increment('entries', 1)
	.then(entries => (entries.length) ? resp.json(entries[0]) : resp.status(404).json("Cannot Process Request"))
	.catch(err => resp.status(404).json("Cannot Process Request") );
} 

const imageData = (clarifaiApp) => (req,response) =>{
	clarifaiApp.models.predict(Clarifai.FACE_DETECT_MODEL,  req.body.imageUrl)
	.then(clarifaiResp => response.json(clarifaiResp))
	.catch(err => response.status(404).json("Cannot Get Value"));
}

module.exports = {
	updateEntries: updateEntries,
	imageData
}