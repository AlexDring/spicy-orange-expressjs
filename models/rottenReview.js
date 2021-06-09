const mongoose = require('mongoose');
const { findByIdAndUpdate } = require('../models/media');
const Media = require('../models/media')

const rottenReviewSchema = new mongoose.Schema({
  mediaDetailId: String,
  mediaId: String,
  avatar: String,
  user: String,
  title: String,
  poster: String,
  score: Number,
  review: String,
})

rottenReviewSchema.statics.calcAverageRatings = async function (mediaDetailId, mediaId) {
  console.log('Now this', mediaDetailId);
  // console.log(mediaId);
  const stats = await this.aggregate([
    {
      $match: { mediaDetailId: mediaDetailId }
    },
    {
      $group: {
        _id: '$mediaDetailId',
        nReviews: { $sum: 1 },
        avgReview: { $avg: '$score' }
      }
    }
    // {
    //   "$group": {
    //     _id: '$mediaDetail', 
    //     avgReview: { $avg: "$score" },
    //     nReviews: { $sum: 1 }
    //   } 
    // }
  ])
  console.log(stats);
  await Media.findByIdAndUpdate(mediaId, {
    rottenCount: stats[0].nReviews,
    rottenAverage: stats[0].avgReview
  })
}

rottenReviewSchema.post('save', function() {
  console.log('THIS RUNS');
  this.constructor.calcAverageRatings(this.mediaDetailId, this.mediaId)
})

rottenReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  console.log('rrrrr', this.r);
  next()
})

// rottenReviewSchema.pre(/^remove/, async function(next) {

//   this.r = await this.findOne()
//   console.log('rrrrr', this.r);
//   next()
// })

rottenReviewSchema.post(/^findOneAnd/, async function() {
  //   this.r = await this.findOne() does not work here, query has already been executed.
  await this.r.constructor.calcAverageRatings(this.r.mediaDetailId, this.r.mediaId)
  console.log('rrrrr', this.r);
})

const Review = mongoose.model('Review', rottenReviewSchema)

module.exports = Review

