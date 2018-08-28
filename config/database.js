require('dotenv').config()

module.exports = {
  database: process.env.DATABASE,
  secret: process.env.DATABASE_SECRET
};
