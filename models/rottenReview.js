const mongoose = require('mongoose')

const rottenReviewSchema = new mongoose.Schema({
  user: String,
  score: Number,
  review: String,
  poster: String,
  title: String
})

module.exports = mongoose.model('RottenReview', rottenReviewSchema)
