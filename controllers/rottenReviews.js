const rottenReviewRouter = require('express').Router()
const RottenReviews = require('../models/rottenReview')
const MediaDetail = require('../models/mediaDetail')
const rottenReview = require('../models/rottenReview')

rottenReviewRouter.get('/', async (req, res) => {
  const result = await RottenReviews.find({})
  res.json(result)
})

rottenReviewRouter.route('/:mediaDetailId') // Move this from mediaRouter - makes more sense being in rotten review router?
  .post(async (req, res) => {
    const { mediaDetailId, mediaId, user, score, review, avatar, title, poster } = req.body

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
      review: review
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
    console.log('mediaDetailReview', mediaDetailReview);
    console.log(body)
    mediaDetailReview.score = body.score
    mediaDetailReview.review = body.review
    
    const result = await mediaDetail.save()
    console.log(result);
    await RottenReviews.findByIdAndUpdate(reviewId, body)

    res.status(201).json(result)
  })

module.exports = rottenReviewRouter