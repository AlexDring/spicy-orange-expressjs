const config = require('./utils/config')
const express = require('express')
require('express-async-errors');
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const cors = require('cors')

const usersRouter = require('./controllers/users')
const profileRouter = require('./controllers/profile')
const loginRouter = require('./controllers/login')
const omdbRouter = require('./controllers/omdb')
const mediaRouter = require('./controllers/media')
const rottenReviewRouter = require('./controllers/rottenReviews')

const middleware = require('./utils/middleware')
const app = express()
var morgan = require('morgan');

mongoose.set('useCreateIndex', true)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })
mongoose.set('useFindAndModify', false)

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/profile', profileRouter)
app.use('/api/login', loginRouter)
app.use('/api/omdb', omdbRouter)
app.use('/api/media', mediaRouter)
app.use('/api/rottenReviews', rottenReviewRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app