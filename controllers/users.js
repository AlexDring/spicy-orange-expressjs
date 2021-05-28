const usersRouter = require('express').Router()
// A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router. - http://expressjs.com/en/5x/api.html#router
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.route('/')
  .get(async (req, res) => {
    const response = await User.find({})
    console.log(response);
    res.json(response)
  })
  .post(async (req, res) => {
    const { username, name, password } = req.body

    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    const passwordHash = bcrypt.hashSync(password, salt)

    const user = new User ({
      username: username,
      name: name,
      passwordHash: passwordHash
    })

    const savedUser = await user.save()
    res.json(savedUser)
  })

module.exports = usersRouter