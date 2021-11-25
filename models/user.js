const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  name: String,
  passwordHash: String,
  avatar: String,
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
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  watchlist: [{
    recommendation: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    date_added: Date,
  }],
  watched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }]
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})


const User = mongoose.model('User', userSchema)

module.exports = User