const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const recommendationDetailSchema = new mongoose.Schema({
  Rated: String,
  Released: String,
  Writer: String,
  Actors: String,
  Plot: String,
  Country: String,
  Awards: String,
  Ratings: [{ Source: String, Value: String }],
  imdbVotes: String,
  imdbID: {
    type: String,
    unique: true
  },
  DVD: String,
  BoxOffice: String,
  Production: String,
  Website: String,
  Response: String,
  dateAdded: String,
  inWatchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rottenReviews: [{ score: Number, user: String, review: String }],
  userId: String
})

recommendationDetailSchema.plugin(uniqueValidator)

module.exports = mongoose.model('RecommendationDetail', recommendationDetailSchema)
