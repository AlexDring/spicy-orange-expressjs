const recommendationRouter = require('express').Router()
const Recommendation = require('../models/media')
const RecommendationDetail = require('../models/mediaDetail')
const User = require('../models/user')
const { jwtCheck } = require('../utils/middleware')

recommendationRouter.route('/')
  .get(async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    // const limit = parseInt(req.query.limit) || 3;
    const search = req.query.title === 'all' ? {} : { Title: { "$regex": req.query.title, "$options": "i" } }

    const response = await Recommendation
    .find(search)
    .sort('-dateAdded')
    .skip(page * 12)
    .limit(12)

    const count = await Recommendation.countDocuments(search)

    res.json({
      recommendations: response,
      totalRecommendations: count
    })
  })
  .post(jwtCheck, async (req, res) => {
    const body = req.body
    const recommendationExists = await RecommendationDetail.exists({ imdbID: body.imdbID })

    if(recommendationExists) {
      return res.status(409).json({ error: 'This recommendation has already been added. Use the search bar on the Recommendations page to find.' })
    }

    const user = await User.findById(body.user_id)

    const savedRecommendationDetail = new RecommendationDetail({
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
      dateAdded: body.date_added,
      user: user.username,
      mediaDetail: savedRecommendationDetail._id
    })

    await savedRecommendationDetail.save()
    const recommendation = await savedRecommendation.save()

    user.recommendations.push(recommendation._id)
    await user.save()

    res.status(201).json(savedRecommendation)
  })

recommendationRouter.route('/:id')
  .get(async (req, res) => {
    const response = await Recommendation.findById(req.params.id).populate('mediaDetail')

    res.json(response)
  })

  recommendationRouter.delete('/:recommendation_id/:recommendationDetail_id', 
    jwtCheck, async (req, res) => {
      const { recommendation_id, recommendationDetail_id } = req.params
      const recommendation = await Recommendation.findById(recommendation_id)
      const recommendationDetail = await RecommendationDetail.findById(recommendationDetail_id)

      // if(req.user._id !== mediaDetail.userId) {
      //   return res.status(405).json({ error: 'only the user who added the recommendation can delete it' })
      // }

      if(recommendationDetail.rottenReviews.length > 0) {
        return res.status(405).json({ error: `Recommendations that have rotten reviews can't be deleted.` })
      }

      if(recommendationDetail.inWatchlist.length > 0) {
        return res.status(405).json({ error: `Can't delete this recommendation, its been added to someones watchlist.` })
      }

      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          recommendations: {_id: recommendation_id}
        }
      })

      await recommendation.remove()
      await recommendationDetail.remove()

      res.status(204).end()
    }
  )

module.exports = recommendationRouter