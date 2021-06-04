const rottenReviewRouter = require('express').Router()
const RottenReview = require('../models/rottenReview')
const MediaDetail = require('../models/mediaDetail')
const jwt = require('jsonwebtoken')

rottenReviewRouter.get('/', async(req, res) => {
  const response = await RottenReview.find({})
  res.json(response)
})

rottenReviewRouter.route('/new-review/:mediaDetailId')
  // .get(async (req, res) => {
  //   const response = await RottenReview.findById(req.params.id)
  //   res.json(response)
  // })
  .post(async (req, res) => {
    const { score, review, poster, title } = req.body
    console.log(req.token);
    if(!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    let decodedToken
    try {
      decodedToken = await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const reviewedMediaDetail = await MediaDetail.findById(req.params.mediaDetailId)

    const newReview = new RottenReview({
      mediaDetail: reviewedMediaDetail._id,
      user: decodedToken.username,
      score: score,
      review: review,
      poster: poster,
      title: title
    })
    // console.log(reviewedMediaDetail);
    reviewedMediaDetail.rottenReviews.push(newReview)

    await newReview.save()
    await reviewedMediaDetail.save()

    res.status(201).json(newReview)
    })
  
rottenReviewRouter.route('/:reviewId')
  .put()

module.exports = rottenReviewRouter