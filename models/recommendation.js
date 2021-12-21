const mongoose = require('mongoose')

const recommendationSchema = new mongoose.Schema({
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
  rottenCount: Number,
  rottenAverage: Number,
  dateAdded: String,
  user: String,
  recommendationDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'RecommendationDetail' },
})

module.exports = mongoose.model('Recommendation', recommendationSchema)
