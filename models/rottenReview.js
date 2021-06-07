const mongoose = require('mongoose')

const rottenReviewSchema = new mongoose.Schema({
  user: String,
  avatar: String,
  score: Number,
  review: String
})

module.exports = rottenReviewSchema