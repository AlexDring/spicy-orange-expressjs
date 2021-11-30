const rottenReviewRouter = require('express').Router()
const RottenReviews = require('../models/rottenReview')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')
const { authenticateUser } = require('../utils/middleware')

rottenReviewRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  // const limit = parseInt(req.query.limit) || 3;
  
  const response = await RottenReviews.find({})
    .sort('-updatedOn')
    .skip(page * 12)
    .limit(12)

  const count = await RottenReviews.countDocuments({})
  console.log(count)
  res.json({
    reviews: response,
    totalReviews: count
  })
})

rottenReviewRouter.route('/:mediaDetailId') // Move this from mediaRouter - makes more sense being in rotten review router?
  .post(authenticateUser, async (req, res) => {
    console.log(req.body);
    const { mediaDetailId, mediaId, score, review, avatar, title, poster, updatedOn } = req.body

    const reviewedMediaDetail = await MediaDetail.findById(req.params.mediaDetailId)

    if(reviewedMediaDetail.rottenReviews.find(r => r.user === user)) {
      return res.status(405).json({ error: 'only one review can be added per user' })
    }

    const user = await User.findById(req.user._id)
  
    const newReview = new RottenReviews({
      mediaDetailId,
      mediaId,
      user,
      avatar,
      title,
      poster,
      score,
      user: user.username,
      review,
      updatedOn
    })

    user.reviews.push(newReview._id)

    reviewedMediaDetail.rottenReviews.push(newReview)
    
    await user.save()
    await newReview.save()
    const result = await reviewedMediaDetail.save()

    res.status(201).json(result)
  })

rottenReviewRouter.route('/:mediaDetailId/:reviewId')
  .delete(authenticateUser, async (req, res) => {
    const { mediaDetailId, reviewId } = req.params
    console.log({reviewId});
    const mediaDetail = await MediaDetail.findById(mediaDetailId)
    mediaDetail.rottenReviews.id(reviewId).remove()
    
    const user = await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        review: {_id: reviewId}
      }
    })

    await mediaDetail.save()
    await user.save()
    await RottenReviews.findByIdAndDelete(reviewId)

    res.status(204).end()
  })
  .put(async (req, res) => {
    const body = req.body
    const { mediaDetailId, reviewId } = req.params

    const mediaDetail = await MediaDetail.findById(mediaDetailId)
    const mediaDetailReview = mediaDetail.rottenReviews.id(reviewId)

    mediaDetailReview.score = body.score
    mediaDetailReview.review = body.review
    mediaDetailReview.updatedOn = body.updatedOn
    
    const result = await mediaDetail.save()

    await RottenReviews.findByIdAndUpdate(reviewId, body)

    res.status(201).json(result)
  })

module.exports = rottenReviewRouter