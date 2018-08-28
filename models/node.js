const mongoose = require('mongoose');

// mongoose only supports Number type and not double which by default will be converted to string
// so using importing library for double data type in mongoose
const Double = require('@mongoosejs/double');

// for auto updation and streamlined incremental integral values in schemas
const mongooseIncrement = require('mongoose-increment');

// for enabling encryption on fields in mongoose schema
const encrypt = require('mongoose-encryption');

// utility functions
const utils = require('../utils/utils');

const encKey = process.env.ENCKEY;
const sigKey = process.env.SIGKEY

const nodeDataSchema = mongoose.Schema({
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
})

//User Schema
const NodeSchema = mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    type: String,
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
    type: String,
    required: true
  },
  hashValue: {
    type: String
  }
});

nodeSchema.plugin(mongooseIncrement, {
  modelName: 'Node',
  fieldName: 'nodeNumber'
})

nodeSchema.plugin(encrypt, {
  secret: process.env.ENCRYPTION_SECRET
  encryptedFields: ['data'] 
})

nodeDataSchema.post('save', (next) => {
  this.hashValue = utils.createHash(new Set([this.ownerId, this.value, this.ownerName]));
})

const Node = module.exports = mongoose.model('Node', NodeScnema);


Node.createGenesis = (value, ownerName, ownerId) => {
  let node = new Node({
    data: {
      ownerId,
      ownerName,
      value
    }
  })
}