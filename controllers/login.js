const loginRouter = require('express').Router()
const User = require('../models/user')
const { authenticateUser } = require('../utils/middleware')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username: username })

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return res.status(400).json({
      error: 'Invalid password or username. Please try again.'
    })
  }

  const userForToken = {
    username: username,
    _id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '20m' })

  res.status(200).send({
    token,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    _id: user._id,
  })
})

loginRouter.get('/me', authenticateUser, async (req, res) => {
  const user = await User.findById(req.user._id)
  console.log('me', user);
  res.json(user)
})


module.exports = loginRouter
