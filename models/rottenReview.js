const mongoose = require('mongoose');
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

// Below is a static method that gets the called by the .post/.pre middleware below, each time a review is posted, edited, deleted. It's created as a static method because the aggregate function needs to be called on the model.
rottenReviewSchema.statics.calcAverageRatings = async function (mediaDetailId, mediaId) {  
  console.log(mediaDetailId, mediaId);
  const stats = await this.aggregate([
    {
      $match: { mediaDetailId: mediaDetailId } // Selects all reviews that match the mediaDetailId passed into the function
    },
    {
      $group: { // this then calculates the number of reviews and average rating based on score of all matched reviews.
        _id: '$mediaDetailId', 
        nReviews: { $sum: 1 },
        avgReview: { $avg: '$score' }
      }
    }
  ])

  if(stats.length > 0) {
    await Media.findByIdAndUpdate(mediaId, { // This then gets the relevant media document and updates the rottenCount and rottenAverage with the returned calculations
      rottenCount: stats[0].nReviews,
      rottenAverage: stats[0].avgReview
    })
  } else { // or sets them to zero
    await Media.findByIdAndUpdate(mediaId, {
      rottenCount: 0,
      rottenAverage: 0
    })
  }
}

rottenReviewSchema.post('save', function() { // This calls the above function when a new review is created - https://mongoosejs.com/docs/middleware.html#post
  this.constructor.calcAverageRatings(this.mediaDetailId, this.mediaId) // this.constructor is used because it points to the document that is currently being saved
  // The calcAverageRatings function is available on this model - the above is the same as Review.constructor.calcAverageRatings(this.mediaDetailId, this.mediaId) but because Review hasn't been declared yet we need to use this.
})

// Reviews are edited and deleted using findByIdAndDelete/findByIdAndUpdate - this means that there isn't document middleware, only query middleware meaning we don't have direct access to the document, so we can't do something similar to the above .post. Instead we need to try and get the relevant mediaid/mediaDetailID to call the calcAverageRatings function. - 
// https://mongoosejs.com/docs/middleware.html#types-of-middleware 
// https://mongoosejs.com/docs/4.x/docs/middleware.html

rottenReviewSchema.pre(/^findOneAnd/, async function(next) { // regex findOneAnd matches with the edit/delete findByIdAndDelete/findByIdAndUpdate which are shorthand for findOneAnd... . It gets next keyword as it's pre middleware.
  this.r = await this.findOne() // this.findOne gives us the document currently being processed. To pass it onto the middleware below.
  // because this is .pre, it gives us the document before changes have been made. We need to use this.r to attach it to the current query variable which gives us access to it in the .post middleware. object so that it can be used with the calcAverageRatings method after it's been written to the database.

  next() // because this is pre middleware we need to call next()
})

rottenReviewSchema.post(/^findOneAnd/, async function() {
  //   this.r = await this.findOne() does not work here, query has already been executed.
  await this.r.constructor.calcAverageRatings(this.r.mediaDetailId, this.r.mediaId)
})

module.exports = mongoose.model('Review', rottenReviewSchema)

