const mongoose = require('mongoose')
const rottenReviewSchema = require('../models/rottenReview')

const mediaSchema = new mongoose.Schema({
  Poster: String,
  Title: String,
  Type: String,
  Year: String,
  Runtime: String,
  Director: String,
  Genre: String,
  Language: String,
  Metascore: String,
  imdbRating: String,
  rottenAverage: Number,
  dateAdded: String,
  user: String,
  mediaDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaDetail' },
})

module.exports = mongoose.model('Media', mediaSchema)
