const rottenReviewRouter = require('express').Router()
const RottenReviews = require('../models/rottenReview')
const RecommendationDetail = require('../models/recommendationDetail')
const User = require('../models/user')
const { jwtCheck } = require('../utils/middleware')

rottenReviewRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  // const limit = parseInt(req.query.limit) || 3;
  
  const response = await RottenReviews.find({})
    .sort('-updatedOn')
    .skip(page * 12)
    .limit(12)

  const count = await RottenReviews.countDocuments({})

  res.json({
    reviews: response,
    totalReviews: count
  })
})

rottenReviewRouter.route('/:recommendationDetailId')
  .post(jwtCheck, async (req, res) => {
    const { userId, recommendationId, score, review, avatar, title, poster, updatedOn } = req.body

    const reviewedRecommendationDetail = await RecommendationDetail.findById(req.params.recommendationDetailId)

    const user = await User.findById(userId)

    if(reviewedRecommendationDetail.rottenReviews.find(r => r.user === user)) {
      return res.status(405).json({ error: 'only one review can be added per user' })
    }
  
    const newReview = new RottenReviews({
      recommendationId,
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

    reviewedRecommendationDetail.rottenReviews.push(newReview)
    
    await user.save()
    await newReview.save()
    const result = await reviewedRecommendationDetail.save()

    res.status(201).json(result)
  })

rottenReviewRouter.route('/:recommendationDetailId/:reviewId')
  .delete(jwtCheck, async (req, res) => {
    const { userId, recommendationDetailId, reviewId } = req.params
    const recommendationDetail = await RecommendationDetail.findById(recommendationDetailId)
    recommendationDetail.rottenReviews.id(reviewId).remove()

    await User.findByIdAndUpdate(userId, {
      $pull: {
        review: {_id: reviewId}
      }
    })
    
    await recommendationDetail.save()
    await RottenReviews.findByIdAndDelete(reviewId)

    res.status(204).end()
  })
  .put(jwtCheck, async (req, res) => {
    const body = req.body
    const { recommendationDetailId, reviewId } = req.params

    const recommendationDetail = await RecommendationDetail.findById(recommendationDetailId)
    const recommendationDetailReview = recommendationDetail.rottenReviews.id(reviewId)

    recommendationDetailReview.score = body.score
    recommendationDetailReview.review = body.review
    recommendationDetailReview.updatedOn = body.updatedOn
    
    const result = await recommendationDetail.save()

    await RottenReviews.findByIdAndUpdate(reviewId, body)

    res.status(201).json(result)
  })

module.exports = rottenReviewRouter