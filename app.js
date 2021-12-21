const config = require('./utils/config')
const express = require('express')
require('express-async-errors');
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const cors = require('cors')

const usersRouter = require('./controllers/users')
const omdbRouter = require('./controllers/omdb')
const recommendationRouter = require('./controllers/recommendations')
const rottenReviewRouter = require('./controllers/rottenReviews')

const middleware = require('./utils/middleware')
const app = express()
const morgan = require('morgan');

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

app.use('/api/users', usersRouter)
app.use('/api/omdb', omdbRouter)
app.use('/api/recommendations', recommendationRouter)
app.use('/api/rottenReviews', rottenReviewRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app