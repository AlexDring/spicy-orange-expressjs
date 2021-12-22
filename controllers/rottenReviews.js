const rottenReviewRouter = require('express').Router()
const RottenReviews = require('../models/rottenReview')
const Recommendation = require('../models/recommendation')
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

rottenReviewRouter.route('/:recommendationId')
  .post(jwtCheck, async (req, res) => {
    const { userId, recommendationId, score, review, avatar, title, poster, updatedOn } = req.body

    const recommendation = await Recommendation.findById(req.params.recommendationId)

    const user = await User.findById(userId)

    if(recommendation.rottenReviews.find(r => r.user === user.username)) {
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

    recommendation.rottenReviews.push(newReview)
    
    await user.save()
    await newReview.save()
    const result = await recommendation.save()

    res.status(201).json(result)
  })

rottenReviewRouter.route('/:recommendationId/:reviewId')
  .delete(jwtCheck, async (req, res) => {
    const { recommendationId, reviewId } = req.params
    
    const recommendation = await Recommendation.findById(recommendationId)
    recommendation.rottenReviews.id(reviewId).remove()
    
    const user = await User.findById(req.body.userId)
    user.reviews.remove(reviewId) // This works because it's an objectId

    await user.save()
    await recommendation.save()
    await RottenReviews.findByIdAndDelete(reviewId)

    res.status(204).end()
  })
  .put(jwtCheck, async (req, res) => {
    const { recommendationId, reviewId } = req.params
    const body = req.body

    const recommendation = await Recommendation.findById(recommendationId)
    const recommendationReview = recommendation.rottenReviews.id(reviewId)

    recommendationReview.score = body.score
    recommendationReview.review = body.review
    recommendationReview.updatedOn = body.updatedOn
    
    const result = await recommendation.save()

    await RottenReviews.findByIdAndUpdate(reviewId, body)

    res.status(201).json(result)
  })

module.exports = rottenReviewRouter