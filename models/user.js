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
  recommendations: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendations' }
  ],
  watchlist: [{
    toWatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendations' },
    dateAdded: Date,
  }],
  watched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendations' }]
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User