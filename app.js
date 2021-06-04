const config = require('./utils/config')
const express = require('express')
require('express-async-errors');
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const omdbRouter = require('./controllers/omdb')
const mediaRouter = require('./controllers/media')

const middleware = require('./utils/middleware')
const app = express()
var morgan = require('morgan');


mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info(`connected to MongoDb`)
  }).catch((error) => {
    logger.error(`error connecting to MongoDb`, error.message)
  })

app.use(morgan('tiny'))
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/omdb', omdbRouter)
app.use('/api/media', mediaRouter)


module.exports = app