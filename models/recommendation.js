const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


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
  Released: String,
  Writer: String,
  Actors: String,
  Plot: String,
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
  totalSeasons: String,
  inWatchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rottenReviews: [{ score: Number, user: String, review: String, avatar: String }],
  userId: String,
  userAvatar: String,
  username: String,
})

recommendationSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Recommendation', recommendationSchema)
