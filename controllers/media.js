const mediaRouter = require('express').Router()
const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { response } = require('express')

mediaRouter.route('/')
  .get(async (req, res) => {
    const response = await Media.find({})

    res.json(response)
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
      dateAdded: body.dateAdded,
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
  .delete(async (req, res) => {
    const { mediaId, mediaDetailId } = req.body

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!req.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const media = await Media.findById(mediaId)
    const mediaDetail = await MediaDetail.findById(mediaDetailId)

    if(user._id.toString() !== mediaDetail.userId) {
      return res.status(401).json({ error: 'only the user who added media can delete it' })
    }

    if(mediaDetail.rottenReviews.length > 0) {
      return res.status(401).json({ error: 'media with rotten reviews can\'t be deleted' })
    }

    await media.remove()
    await mediaDetail.remove()

    res.status(204).end()
  })

module.exports = mediaRouter