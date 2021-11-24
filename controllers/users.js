const usersRouter = require('express').Router()
// A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router. - http://expressjs.com/en/5x/api.html#router
const bcrypt = require('bcrypt')
const middleware = require('../utils/middleware')
const User = require('../models/user')
const Profile = require('../models/profile')

usersRouter.route('/')
  .post(async (req, res) => {
    const { username, name, password } = req.body

    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    const passwordHash = bcrypt.hashSync(password, salt)

    const profile = new Profile()
    
    const user = new User ({
      username: username,
      name: name,
      passwordHash: passwordHash,
      profile_id: profile._id
    })

    await profile.save()
    const savedUser = await user.save()
    res.json(savedUser)
  })

usersRouter.route('/:id')
  .get(async (req, res) => {
    const user = await User.findById(req.params.id)
    console.log(user, 'user');
    res.json(user)
  })
  .put(async (req, res) => {
    const { avatar } = req.body

    const updateUser = await User.findById(req.params.id)

    updateUser.avatar = avatar
    const savedUser = await updateUser.save()

    res.json(savedUser)
  })

usersRouter.route('/:id/watchlist')
  .get(async (req, res) => {
    const watchlist = await User.findById(req.params.id).populate('watchlist.media')

    res.json(watchlist) 
  })
  .post(middleware.authenticateUser, async (req, res) => {
    const { media_id, date_added } = req.body
    const user = await User.findById(req.user.id)

    user.watchlist.push({ media_id, date_added })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
  })
  
module.exports = usersRouter