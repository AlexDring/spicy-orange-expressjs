const mediaRouter = require('express').Router()
const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')
const Review = require('../models/rottenReview')
const jwt = require('jsonwebtoken')
// const { response } = require('express')

mediaRouter.route('/')
  .get(async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    // const limit = parseInt(req.query.limit) || 3;
    const search = req.query.title === 'all' ? {} : { Title: { "$regex": req.query.title, "$options": "i" } }

    const response = await Media
    .find(search)
    .sort('-dateAdded')
    .skip(page * 12)
    .limit(12)

    const count = await Media.countDocuments(search)

    res.json({
      recommendations: response,
      totalRecommendations: count
    })
  })
  .post(async (req, res) => {
    const body = req.body
    if(!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    let decodedToken
    try {
      decodedToken = await jwt.verify(req.token, process.env.SECRET)
    } catch(error) {
      return res.status(401).json({ error: 'token invalid' })
    }

    console.log('decodedToken', decodedToken);
    const mediaExists = await MediaDetail.exists({ imdbID: body.imdbID })

    if(mediaExists) {
      return res.status(409).json({ error: 'This recommendation has already been added. Use the search on the Recommendations page to find.' })
    }

    const savedMediaDetail = new MediaDetail({
      Actors: body.Actors,
      Awards: body.Awards,
      BoxOffice: body.BoxOffice,
      Country: body.Country,
      DVD: body.DVD,
      Plot: body.Plot,
      Production: body.Production,
      Rated: body.Rated,
      Ratings: body.Ratings,
      Released: body.Released,
      Website: body.Website,
      Writer: body.Writer,
      imdbID: body.imdbID,
      imdbVotes: body.imdbVotes,
      Response: body.Response,
      rottenReviews: body.rottenGas,
      userId: decodedToken.id
    })

    const savedMedia = new Media({
      Poster: body.Poster,
      Title: body.Title,
      Type: body.Type,
      Year: body.Year,
      Runtime: body.Runtime,
      Director: body.Director,
      Genre: body.Genre,
      Language: body.Language,
      Metascore: body.Metascore,
      imdbRating: body.imdbRating,
      Type: body.Type,
      dateAdded: body.date_added,
      user: decodedToken.username,
      mediaDetail: savedMediaDetail._id
    })


    await savedMediaDetail.save()
    await savedMedia.save()

    res.status(201).json(savedMedia)
  })

mediaRouter.route('/:id')
  .get(async (req, res) => {
    const response = await Media.findById(req.params.id).populate('mediaDetail')

    res.json(response)
  })

  mediaRouter.delete('/:media_id/:mediaDetail_id', async (req, res) => {
    const { media_id, mediaDetail_id } = req.params

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!req.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const media = await Media.findById(media_id)
    const mediaDetail = await MediaDetail.findById(mediaDetail_id)
    
    if(user._id.toString() !== mediaDetail.userId) {
      return res.status(400).json({ error: 'only the user who added the recommendation can delete it' })
    }

    if(mediaDetail.rottenReviews.length > 0) {
      return res.status(400).json({ error: 'Recommendations with rotten reviews can\'t be deleted' })
    }

    await media.remove()
    await mediaDetail.remove()

    res.status(204).end()
  })

  mediaRouter.route('/:mediaDetailId/review')
  .post(async (req, res) => {
    const { mediaDetailId, mediaId, user, score, review, avatar, title, poster, date_added } = req.body

    // const reviewedMedia = await Media.findById(req.params.mediaId)
    const reviewedMediaDetail = await MediaDetail.findById(req.params.mediaDetailId)
    // console.log(reviewedMediaDetail);

    if(reviewedMediaDetail.rottenReviews.find(r => r.user === user)) {
      return res.status(401).json({ error: 'only one review can be added per user' })
    }
  
    const newReview = new Review({
      mediaDetailId: mediaDetailId,
      mediaId: mediaId,
      user: user,
      avatar: avatar,
      title: title,
      poster: poster,
      score: score,
      review: review,
      date_added: date_added
    })

    reviewedMediaDetail.rottenReviews.push(newReview)

    await newReview.save()
    const result = await reviewedMediaDetail.save()

    res.status(201).json(result)
  })
  .put(async (req, res) => {
    const { reviewId, score, review } = req.body

    const mediaDetail = await MediaDetail.findById(req.params.mediaDetailId)

    await Review.findByIdAndUpdate(reviewId, {
      score: score,
      review: review
    }) 

    // console.log(updateReview);

    const updatedReview = {
      score: score,
      review: review
    }

    const oldReview = mediaDetail.rottenReviews.id(reviewId)
    oldReview.set(updatedReview)
    // Info on subdocument .id method and .set can be found here - https://stackoverflow.com/questions/40642154/use-mongoose-to-update-subdocument-in-array. Mongoose docs for .id are missing!!!

    // await updateReview.save()
    const result = await mediaDetail.save()
    res.status(201).json(result)
  })  
  .delete(async (req, res) => {
    const { reviewId, mediaDetailId} = req.body

    const mediaDetail = await MediaDetail.findById(mediaDetailId)
    
    mediaDetail.rottenReviews.id(reviewId).remove()
    
    await Review.findByIdAndDelete(reviewId)
    await mediaDetail.save()

    res.status(204).end()
  })

module.exports = mediaRouter