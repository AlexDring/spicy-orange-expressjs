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
  // recommendationDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'RecommendationDetail' },
  // Rated: String,
  Released: String,
  Writer: String,
  Actors: String,
  Plot: String,
  // Country: String,
  Awards: String,
  Ratings: [{ Source: String, Value: String }],
  imdbVotes: String,
  imdbID: {
    type: String,
    unique: true
  },
  BoxOffice: String,
  Production: String,
  Response: String,
  dateAdded: String,
  inWatchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rottenReviews: [{ score: Number, user: String, review: String }],
  userId: String
})

module.exports = mongoose.model('Recommendation', recommendationSchema)
