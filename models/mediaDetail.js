const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const mediaDetailSchema = new mongoose.Schema({
  // media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
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
  rottenReviews: [{ score: Number, user: String, review: String }],
  userId: String
})

mediaDetailSchema.plugin(uniqueValidator)

module.exports = mongoose.model('MediaDetail', mediaDetailSchema)
