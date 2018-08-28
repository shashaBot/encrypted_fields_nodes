const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// mongoose only supports Number type and not double which by default will be converted to string
// so using importing library for double data type in mongoose
const Double = require('@mongoosejs/double');

// for auto updation and streamlined incremental integral values in schemas
const mongooseIncrement = require('mongoose-increment');
const increment = mongooseIncrement(mongoose);

// for enabling encryption on fields in mongoose schema
const encrypt = require('mongoose-encryption');

// utility functions
const utils = require('../utils/utils');

const encKey = process.env.ENCKEY;
const sigKey = process.env.SIGKEY

const NodeDataSchema = mongoose.Schema({
	ownerId: {
		type: String,
		required: true
	},
	value: {
		type: Double,
		required: true,
	},
	ownerName: {
		type: String,
		required: true
	},
	hashValue: {
		type: String
	}
}, {_id: false})

//User Schema
const NodeSchema = mongoose.Schema({
	timestamp: {
		type: Date,
		default: Date.now
	},
	data: {
		type: NodeDataSchema,
		required: true
	},
	nodeId: {
		type: String,
		required: true
	},
	referenceNodeId: {
		type: String
	},
	childReferenceNodeId: {
		type: [String],
		required: true
	},
	genesisReferenceNodeId: {
		type: String
	},
	hashValue: {
		type: String
	},
	capacity: {
		type: String,
		requried: true,
		validate: [checkCapacity, 'Operation cannot performed as resulting nodes do not satisfy trickle down property']
	}
});

NodeSchema.plugin(increment, {
	modelName: 'Node',
	fieldName: 'nodeNumber'
})

NodeSchema.plugin(encrypt, {
	secret: process.env.ENCRYPTION_SECRET,
	encryptedFields: ['data'],
	decryptPostSave: false
})

// validate capacity of node
function checkCapacity(val) {
	return parseFloat(val)>=0
}

NodeSchema.pre('validate', function(next) {
	if(!this.referenceNodeId) {
		return next()
	}

	Node.updateCapacity(this.referenceNodeId, 0-parseFloat(this.data.value))
		.then( res => {
			next()
		})
		.catch(err => {
			next(err)
		})
})

// add hashValue to node before saving
// if node has parent, add its id to parent childReferenceNodeId.
NodeSchema.pre('save', function(next) {
	if(this.referenceNodeId) {
		Node.addChildToNode(this.referenceNodeId, this.nodeId)
			.then( res => {
				this.hashValue = utils.createHash(JSON.stringify([
						this.timestamp,
						this.data,
						this.nodeId,
						this.referenceNodeId,
						this.childReferenceNodeId,
						this.genesisReferenceNodeId
					])
				)
				next()
			})
			.catch( err => {
				next(err)
			})
	}
	else {
		this.hashValue = utils.createHash(JSON.stringify([
				this.timestamp,
				this.data,
				this.nodeId,
				this.referenceNodeId,
				this.childReferenceNodeId,
				this.genesisReferenceNodeId
			])
		)
		next()		
	}

})


const Node = module.exports = mongoose.model('Node', NodeSchema);


Node.createGenesis = (value, ownerName, ownerId) => {

	let node = new Node({
		data: {
			ownerId,
			ownerName,
			value,
			hashValue: utils.createHash(JSON.stringify([ownerName, ownerId, value]))
		},
		nodeId: utils.gen32BitId(),
		capacity: value
	})
	console.log('doc', node)
	return node.save()
}

Node.createChild = (referenceNodeId, value, ownerName, ownerId) => {
	let genesisReferenceNodeId
	let node = new Node()

	return new Promise((resolve, reject) => {
		Node.findOne({nodeId: referenceNodeId}).exec()
				.then( result => {
					if(!result) {
						let err = new Error('No node was found with that ID')
						err.statusCode = 400
						throw err
					}
					genesisReferenceNodeId = result.genesisReferenceNodeId || referenceNodeId
					let newNode = new Node({
						data: {
							ownerId,
							ownerName,
							value,
							hashValue: utils.createHash(JSON.stringify([ownerName, ownerId, value]))
						},
						nodeId: utils.gen32BitId(),
						referenceNodeId,
						genesisReferenceNodeId
					})
					return newNode.save() 
				})
				.then( node => {
					resolve(node)
				})
				.catch( err => {
					console.log('err in child', err)
					reject(err)
				})
	})

}

Node.addChildToNode = (nodeId, childId) => {
	return Node.findOneAndUpdate({nodeId}, {$push: {childReferenceNodeId: childId}}).exec()
}

Node.updateCapacity = (nodeId, value) => {
	return new Promise( (resolve, reject) => {
		Node.findOne({nodeId}).exec()
			.then( node => {
				node.capacity = parseFloat(node.capacity) + parseFloat(value)
				return node.save()
			})
			.then( node => {
				return resolve(node)
			})
			.catch( err => {
				return reject(err)
			})
	})
}

Node.getNode = (nodeId, ownerName, ownerId) => {
	return new Promise( (resolve, reject) => {
		Node.findOne({nodeId}).exec()
			.then( node => {
				if(!node) throw new Error('Could not find that node')
				if( node.data.ownerName == ownerName && node.data.ownerId == ownerId ) return resolve(node)
				else throw new Error('You are not authorized to access this resource')
			})
			.catch(err => {
				console.log('error in getting node', err)
				return reject(err)
			})
	})

}

Node.getChildNodes = (nodeId, ownerName, ownerId) => {
	return new Promise( (resolve, reject) => {
		Node.findOne({nodeId})
		.then( node => {
			if(node.data.ownerName != ownerName || node.data.ownerId != ownerId) throw new Error('Unauthorized')
			let childPromises = []
			for(let childId of node.childReferenceNodeId) {
				childPromises.push(Node.findOne({nodeId: childId}))
			}
			return Promise.all(childPromises)
		})
		.then( nodes => {
			let result = []
			for(let currNode of nodes) {
				let curr = {...currNode._doc}
				console.log('curr node', curr)
				if(curr.data.ownerName == ownerName && curr.data.ownerId == ownerId) {
					console.log('owner match')
					result.push(curr)
				} else {
					console.log('owner doesnt match')
					delete curr['data']
					curr['info'] = "You cannot access data on this node because you are not its owner"
					result.push(curr)
				}
			}
			return resolve(result)
		})
		.catch( err => {
			return reject(err)
		})
	})
}