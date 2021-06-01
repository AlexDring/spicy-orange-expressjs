const mongoose = require('mongoose')

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
  user: String
})

module.exports = mongoose.model('Media', mediaSchema)
