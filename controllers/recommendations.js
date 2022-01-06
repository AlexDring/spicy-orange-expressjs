const recommendationRouter = require('express').Router()
const Recommendation = require('../models/recommendation')
const User = require('../models/user')
const { jwtCheck } = require('../utils/middleware')

recommendationRouter.route('/')
  .get(async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    // const limit = parseInt(req.query.limit) || 3;
    const search = req.query.title === 'all' ? {} : { Title: { "$regex": req.query.title, "$options": "i" } }

    const response = await Recommendation.find(search).sort('-dateAdded').skip(page * 12).limit(12)

    const count = await Recommendation.countDocuments(search)

    res.json({
      recommendations: response,
      totalRecommendations: count
    })
  })
  .post(jwtCheck, async (req, res) => {
    const body = req.body

    const recommendationExists = await Recommendation.findOne({ imdbID: body.imdbID })

    if(recommendationExists) {
      return res.status(409).json({ 
        id: recommendationExists._id, 
        error: `${recommendationExists.user}'s already added this to Spicy Orange Database.` 
      })
    }

    const user = await User.findById(body.userId)
    console.log(user);

    const savedRecommendation = new Recommendation({
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
      user: user.username,
      Actors: body.Actors,
      Awards: body.Awards,
      BoxOffice: body.BoxOffice,
      Country: body.Country,
      Plot: body.Plot,
      Production: body.Production,
      Rated: body.Rated,
      Ratings: body.Ratings,
      Released: body.Released,
      Writer: body.Writer,
      imdbID: body.imdbID,
      imdbVotes: body.imdbVotes,
      rottenReviews: body.rottenGas,
      userId: user._id,
      userAvatar: user.avatar,
      username: user.username
    })

    const recommendation = await savedRecommendation.save()

    user.recommendations.push(recommendation._id)
    await user.save()

    res.status(201).json(savedRecommendation)
  })

recommendationRouter.route('/:id')
  .get(async (req, res) => {
    const response = await Recommendation.findById(req.params.id)

    res.json(response)
  })

  recommendationRouter.delete('/:recommendationId', 
    jwtCheck, async (req, res) => {
      const { recommendationId } = req.params
      const recommendation = await Recommendation.findById(recommendationId)
      const user = await User.findById(req.body.userId)

      if(user._id.toString() !== recommendation.userId) {
        return res.status(405).json({ error: 'only the user who added the recommendation can delete it' })
      }

      if(recommendation.rottenReviews.length > 0) {
        return res.status(405).json({ error: `Recommendations that have rotten reviews can't be deleted.` })
      }

      if(recommendation.inWatchlist.length > 0) {
        return res.status(405).json({ error: `Can't delete this recommendation, its been added to someones watchlist.` })
      }

      user.recommendations.remove(recommendationId) 

      await user.save()
      await recommendation.remove()

      res.status(204).end()
    }
  )

module.exports = recommendationRouter