require('dotenv').config() // config will read your .env file, parse the contents, assign it to process.env, and return an Object with a parsed key containing the loaded content or an error key if it failed.

let PORT = process.env.PORT || 3001
let MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
process.env.MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI
}