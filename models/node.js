const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');
const mongooseIncrement = require('mongoose-increment');
const encrypt = require('mongoose-encryption');

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
  hash: {
    type: String,
    required: true
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
    type: String,
    required: true
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
    type: String,
    required: true
  }
});

nodeSchema.plugin(mongooseIncrement, {
  modelName: 'Node',
  fieldName: 'nodeNumber'
})

nodeSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey, 
  encryptedFields: ['data'] 
})

const Node = module.exports = mongoose.model('Node', NodeScnema);
