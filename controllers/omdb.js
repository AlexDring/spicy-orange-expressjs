const omdbRouter = require('express').Router()
const fetch = require('node-fetch');
const apiKey = process.env.OMDB_KEY

omdbRouter.get('/:query', async (request, response) => {
  const { query } = request.params

  const apiResponse = await fetch(`http://www.omdbapi.com/?${query}&${apiKey}`)
  const json = await apiResponse.json()

  response.json(json)
})

omdbRouter.get('/:query/:page', async (request, response) => {
  const { query, page } = request.params

  const apiResponse = await fetch(`http://www.omdbapi.com/?${query}&${apiKey}&${page}`)
  const json = await apiResponse.json()

  response.json(json)
})

module.exports = omdbRouter