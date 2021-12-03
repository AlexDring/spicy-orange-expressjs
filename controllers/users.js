const usersRouter = require('express').Router()
// A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router. - http://expressjs.com/en/5x/api.html#router
const bcrypt = require('bcrypt')
const { authenticateUser } = require('../utils/middleware')
const User = require('../models/user')
const MediaDetail = require('../models/mediaDetail')

usersRouter.route('/')
  .post(async (req, res) => {
    console.log(req.body);
    const { auth0_id, username, email } = req.body
    console.log(username, email);
    // const saltRounds = 10
    // const salt = bcrypt.genSaltSync(saltRounds)
    // const passwordHash = bcrypt.hashSync(password, salt)
    
    const user = new User ({
      auth0_id,
      // _id,
      username,
      email,
      // passwordHash: passwordHash,
    })

    const savedUser = await user.save()
    console.log(savedUser);
    res.json(savedUser)
  })

usersRouter.route('/:id')
  .get(async (req, res) => {
    console.log(req.params.id);
    // const user = await User.findById(req.params.id,)
    const user = await User.findById(req.params.id)
    console.log(user);
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
    const user = await User.findById(req.params.id).populate('watchlist.recommendation')

    user.watchlist.sort(function(x, y) { // Having to sort this way as using .sort on populate causes bugs when removing from watchlist.
      return y.date_added - x.date_added;
    })

    res.json(user.watchlist) 
  })
  .post(async (req, res) => {
    const { recommendation, date_added } = req.body
    const user = await User.findById(req.params.id)
    const recommendationDetail = await MediaDetail.findById(req.body.recommendation_detail_id)
    console.log(user, recommendationDetail);

    user.watchlist.push({ recommendation, date_added })
    recommendationDetail.inWatchlist.push(user._id)

    await recommendationDetail.save()
    const savedUser = await user.save()

    res.status(201).json(savedUser.watchlist)
  })

usersRouter.delete('/:id/watchlist/:watchlistId', 
  async (req, res) => { 
    const user = await User.findById(req.params.id)
    const recommendationDetail = await MediaDetail.findById(req.body.recommendation_detail_id)

    user.watchlist.remove(req.params.watchlistId)
    recommendationDetail.inWatchlist.splice(user._id)
    
    await recommendationDetail.save()
    await user.save()
    
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