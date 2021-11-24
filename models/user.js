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
  profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  
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
    media_id: String,
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
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