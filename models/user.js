const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  // _id: String,
  auth0_id: String,
  // _id: String,
  // username: {
  //   type: String,
  //   unique: true
  // },
  username: String,
  // name: String,
  email: String,
  passwordHash: String,
  avatar: String,
  recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  watchlist: [{
    recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' },
    dateAdded: Date,
  }],
  watched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }]
})

// userSchema.plugin(uniqueValidator)

// userSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     // the passwordHash should not be revealed
//     delete returnedObject.passwordHash
//   }
// })


const User = mongoose.model('User', userSchema)

module.exports = User