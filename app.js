const express = require('express');
// const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection to MongoDB
db.once('open', function() {
  console.log('Connected to mongoDB!');
})

//check for db errors
db.on('error', function(err) {
  console.log(err);
});

//init app
const app = express();

//body-parser middleware
app.use(bodyParser.json());

// Bring in routes
let Node = require('./routes/node');

//home route
app.get('/', (req, res) => {
  res.send('please use /api route for interacting with CRUD application')
});

app.use('/api', Node);

//start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Server started on port '+ port +' ...');
});
