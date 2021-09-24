const loginRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)
  // Get user
  const user = await User.findOne({ username: username })

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return res.status(401).send({
      error: 'invalid password or username'
    })
  }

  const userForToken = {
    username: username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({
    token,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    profile_id: user.profile_id,
    id: user._id,
  })
})

loginRouter.get('/me', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)
  res.json(user)
})


module.exports = loginRouter
