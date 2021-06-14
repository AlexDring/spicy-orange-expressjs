const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recommendations: [{
    Poster: String,
    Title: String,
    Type: String,
    Year: String,
    Runtime: String,
    Director: String,
    Genre: String,
    Language: String,
  }],
  watchlist: [{
    toWatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendations' },
    dateAdded: Date,
  }],
  watched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendations' }]
})

module.exports = mongoose.model('Profile', profileSchema)