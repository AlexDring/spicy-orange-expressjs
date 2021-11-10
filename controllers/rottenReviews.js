const rottenReviewRouter = require('express').Router()
const RottenReviews = require('../models/rottenReview')
const MediaDetail = require('../models/mediaDetail')

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
  .post(async (req, res) => {
    console.log(req.body);
    const { mediaDetailId, mediaId, user, score, review, avatar, title, poster, updatedOn } = req.body

    // const reviewedMedia = await Media.findById(req.params.mediaId)
    const reviewedMediaDetail = await MediaDetail.findById(req.params.mediaDetailId)
    // console.log(reviewedMediaDetail);

    if(reviewedMediaDetail.rottenReviews.find(r => r.user === user)) {
      return res.status(400).json({ error: 'only one review can be added per user' })
    }
  
    const newReview = new RottenReviews({
      mediaDetailId: mediaDetailId,
      mediaId: mediaId,
      user: user,
      avatar: avatar,
      title: title,
      poster: poster,
      score: score,
      review: review,
      updatedOn: updatedOn
    })

    reviewedMediaDetail.rottenReviews.push(newReview)

    await newReview.save()
    const result = await reviewedMediaDetail.save()

    res.status(201).json(result)
  })

rottenReviewRouter.route('/:mediaDetailId/:reviewId')
  .delete(async (req, res) => {
    const { mediaDetailId, reviewId } = req.params

    const mediaDetail = await MediaDetail.findById(mediaDetailId)
    mediaDetail.rottenReviews.id(reviewId).remove()
    
    await mediaDetail.save()
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