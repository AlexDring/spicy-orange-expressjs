const config = require('./utils/config')
const express = require('express')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const omdbRouter = require('./controllers/omdb')
const usersRouter = require('./controllers/users')

const app = express()
var morgan = require('morgan')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info(`connected to MongoDb`)
  }).catch((error) => {
    logger.error(`error connecting to MongoDb`, error.message)
  })

app.use(morgan('tiny'))
app.use(express.json())

app.use('/api/omdb', omdbRouter)
app.use('/api/users', usersRouter)

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

module.exports = app