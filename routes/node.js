const router = require('express').Router();
let Node = require('./models/node');

module.exports = Router;

router.post('/create_genesis', (req, res) => {
	let {val, ownerName, ownerId} = req.body
	Node.createGenesis(val, ownerName, ownerId)
		.then( res => {
			res.json(res);
		})
		.catch(err => {
			if(err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end();
		})
})

router.post('/create_children', (req, res) => {
	let { valArr, ownerName, ownerId, nodeId} = req.body
	let promises = []
	for(let val in valArr) {
		promises.push(Node.createChild(nodeId, val, ownerName, ownerId))
	}

	Promise.all(promises)
		.then( resArr => {
			res.json(resArr);
		})
		.catch(err => {
			if(err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end();
		})
})

router.post('/create_child', (req, res) => {
	let { val, ownerName, ownerId, nodeId} = req.body
	Node.createChild(nodeId, val, ownerName, ownerId)
		.then( res => {
			res.json(res)
		})
		.catch(err => {
			if(err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end();
		})
})

router.post('/')

router.post('/')

router.post('/')