const config = require('./utils/config')
const express = require('express')
require('express-async-errors');
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path'); 

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
app.use(express.static(path.join(__dirname, 'build'))) // http://expressjs.com/en/starter/static-files.html Whenever express gets an HTTP GET request it will first check if the build directory contains a file corresponding to the request's address. If a correct file is found, express will return it.

// app.use(express.static(path.join(__dirname, './build')));  // https://create-react-app.dev/docs/deployment#serving-apps-with-client-side-routing

// +app.get('/', function(req, res) {
//   -app.get('/*', function (req, res) {
//     console.log(res);
//       res.sendFile(path.join(__dirname, './build', 'index.html'));
//     });
// });

app.get('*', function(req, res) {
  console.log(__dirname, 'build', 'index.html');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.use('/api/users', usersRouter)
app.use('/api/omdb', omdbRouter)
app.use('/api/recommendations', recommendationRouter)
app.use('/api/rottenReviews', rottenReviewRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app