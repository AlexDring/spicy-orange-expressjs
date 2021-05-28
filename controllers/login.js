const loginRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  // Get user
  const user = await User.findOne({ username: username })

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return response.status(401).json({
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
    id: user._id,
  })
})

module.exports = loginRouter
