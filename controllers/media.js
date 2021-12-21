const recommendationRouter = require('express').Router()
const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')
const { jwtCheck } = require('../utils/middleware')

recommendationRouter.route('/')
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
  .post(jwtCheck, async (req, res) => {
    const body = req.body
    const mediaExists = await MediaDetail.exists({ imdbID: body.imdbID })

    if(mediaExists) {
      return res.status(409).json({ error: 'This recommendation has already been added. Use the search on the Recommendations page to find.' })
    }

    const user = await User.findById(body.user_id)

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
      rottenReviews: body.rottenGas,
      userId: user._id
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
      user: user.username,
      mediaDetail: savedMediaDetail._id
    })

    await savedMediaDetail.save()
    const media = await savedMedia.save()

    user.recommendations.push(media._id)
    await user.save()

    res.status(201).json(savedMedia)
  })

recommendationRouter.route('/:id')
  .get(async (req, res) => {
    const response = await Media.findById(req.params.id).populate('mediaDetail')

    res.json(response)
  })

  recommendationRouter.delete('/:media_id/:mediaDetail_id', 
    jwtCheck, async (req, res) => {
      const { media_id, mediaDetail_id } = req.params
      const media = await Media.findById(media_id)
      const mediaDetail = await MediaDetail.findById(mediaDetail_id)

      // if(req.user._id !== mediaDetail.userId) {
      //   return res.status(405).json({ error: 'only the user who added the recommendation can delete it' })
      // }

      if(mediaDetail.rottenReviews.length > 0) {
        return res.status(405).json({ error: `Recommendations that have rotten reviews can't be deleted.` })
      }

      if(mediaDetail.inWatchlist.length > 0) {
        return res.status(405).json({ error: `Can't delete this recommendation, its been added to someones watchlist.` })
      }

      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          recommendations: {_id: media_id}
        }
      })

      await media.remove()
      await mediaDetail.remove()

      res.status(204).end()
    }
  )

module.exports = recommendationRouter