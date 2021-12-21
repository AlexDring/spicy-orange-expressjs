var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dev-lx-zfn8b.us.auth0.com/.well-known/jwks.json'
}),
  audience: 'https://spicyorange.co.uk',
  issuer: 'https://dev-lx-zfn8b.us.auth0.com/',
  algorithms: ['RS256']
});

const authenticateUser = async (req, res, next) => {
  const authHeader = req.get('authorization')
  if(authHeader) {
    const token = authHeader.substring(7)
    try {
      const user = await jwt.verify(token, process.env.SECRET)
      req.user = user
      console.log({user}, 'authenticateUser');
    } catch(error) {
      return res.status(401).json({ error: 'token invalid or missing' })
    }
  }

  next()
}


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

module.exports = { authenticateUser, jwtCheck, errorHandler, unknownEndpoint }