const router = require('express').Router();
let Node = require('../models/node');

module.exports = router;

router.get('/', (req, res) => {
	res.json({
		endpoints: [
			{	
				url: "/create_genesis",
				method: "post",
				fields: ['val', 'ownerName', 'ownerId'],
				desc: "To create genesis node."
			},
			{
				url: "/create_child",
				method: "post",
				fields: ['val', 'ownerName', 'ownerId', 'nodeId'],
				desc: "To create child node with parent node reference nodeId"
			},
			{
				url: "/create_children",
				method: "post",
				fields: ['valArr', 'ownerName', 'ownerId', 'nodeId'],
				desc: "To create mutiple child nodes under node reference nodeId with values defined in array valArr"
			},
			{
				url: "/get_node",
				method: "get",
				query: ['ownerName', 'ownerId', 'nodeId'],
				desc: "To get a particular node"
			},
			{
				url: "/get_child_nodes",
				method: "get",
				query: ['ownerName', 'ownerId', 'nodeId'],
				desc: "To get a child nodes of node with ID nodeId"
			}
		]
	})
})

router.post('/create_genesis', (req, res) => {
	let {val, ownerName, ownerId} = req.body
	Node.createGenesis(val, ownerName, ownerId)
		.then( result => {
			res.json(result);
		})
		.catch(err => {
			console.log(err)
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(JSON.stringify(err));
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
			console.log(err)
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(JSON.stringify(err));
		})
})

router.post('/create_child', (req, res) => {
	let { val, ownerName, ownerId, nodeId} = req.body
	Node.createChild(nodeId, val, ownerName, ownerId)
		.then( result => {
			res.json(result)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(JSON.stringify(err));
		})
})

router.post('/edit_node', (req, res) => {
	let {val, ownerName, ownerId} = req.body
	Node.editNode(nodeId, val, ownerName, ownerId)
		.then( result => {
			res.json(result)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(JSON.stringify(err));
		})
})

router.get('/get_longest_chain/:nodeId', (req, res) => {
	let {nodeId} = req.params
	Node.getLongestChain(nodeId)
		.then( result => {
			res.json(result)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(JSON.stringify(err));
		})
})

router.get('/display_chain/:nodeId', (req, res) => {
	let {nodeId} = req.params
	Node.displayChain(nodeId)
		.then( result => {
			res.send(result)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end();
		})
})

router.get('/get_node', (req, res) => {
	let {nodeId, ownerName, ownerId} = req.query
	Node.getNode(nodeId, ownerName, ownerId)
		.then( node => {
			res.json(node)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(err.message);
		})
})

router.get('/get_child_nodes', (req, res) => {
	console.log('query', req.query)
	let {nodeId, ownerName, ownerId} = req.query
	Node.getChildNodes(nodeId, ownerName, ownerId)
		.then( nodes => {
			res.json(nodes)
		})
		.catch(err => {
			if(err && err.statusCode)
				res.status(err.statusCode).end(err.message);
			else
				res.status(500).end(err.message);
		})
})
