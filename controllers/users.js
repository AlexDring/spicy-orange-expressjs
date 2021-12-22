const usersRouter = require('express').Router()
// A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router. - http://expressjs.com/en/5x/api.html#router
const User = require('../models/user')

const Recommendation = require('../models/recommendation')
const { jwtCheck } = require('../utils/middleware')

usersRouter.route('/')
  .post(async (req, res) => {
    const { username, email } = req.body
    
    const user = new User ({
      username,
      email,
    })

    const savedUser = await user.save()

    res.json(savedUser)
  })

usersRouter.route('/:id')
  .get(async (req, res) => {
    const user = await User.findById(req.params.id)
    res.json(user)
  })
  .put(async (req, res) => {
    const { avatar } = req.body

    const updateUser = await User.findById(req.params.id)

    updateUser.avatar = avatar
    const savedUser = await updateUser.save()

    res.json(savedUser)
  })

usersRouter.get('/:id/recommendations', async (req, res) => {
  const user = await User.findById(req.params.id).populate({ path: 'recommendations'})
  
  res.json(user.recommendations)
})

usersRouter.get('/:id/reviews', async (req, res) => {
  const user = await User.findById(req.params.id).populate({ path: 'reviews'})

  res.json(user.reviews)
})

usersRouter.route('/:id/watchlist')
  .get(async (req, res) => {
    const user = await User.findById(req.params.id).populate('watchlist.recommendationId')

    user.watchlist.sort(function(x, y) { // Having to sort this way as using .sort on populate causes bugs when removing from watchlist.
      return y.dateAdded - x.dateAdded;
    })

    res.json(user.watchlist) 
  })
  .post(jwtCheck, async (req, res) => {
    const { recommendationId, dateAdded } = req.body
    const user = await User.findById(req.params.id)
    const recommendation = await Recommendation.findById(recommendationId)

    if(user.watchlist.some(r => r.recommendationId.toString() === recommendationId)) {
      return res.status(405).json({ error: 'recommendation already in users watchlist' })
    }

    user.watchlist.push({ recommendationId, dateAdded })
    recommendation.inWatchlist.push(user._id)

    await recommendation.save()
    const savedUser = await user.save()

    res.status(201).json(savedUser.watchlist)
  })

usersRouter.delete('/:id/watchlist/:watchlistId', 
  async (req, res) => { 
    const user = await User.findById(req.params.id)
    const recommendation = await Recommendation.findById(req.body.recommendationId)

    user.watchlist.remove(req.params.watchlistId)
    recommendation.inWatchlist.splice(user._id)
    
    await user.save()
    await recommendation.save()
    
    res.status(204).end()
  }
)

// usersRouter.route('/:id/watched')
//   .post(authenticateUser, async (req, res) => {
//     const body = req.body
//     const user = await User.findById(req.params.id)

//     user.watched.push(body.media_id)

//     const savedUser = await user.save()
    
//     res.status(201).json(savedUser)
//   })
//   .delete(authenticateUser, async (req, res) => {
//     const body = req.body

//     const user = await User.findById(req.user._id)

//     user.watched.remove(body.media_id)

//     await user.save()
    
//     res.status(204).end()
//   })
  
module.exports = usersRouter