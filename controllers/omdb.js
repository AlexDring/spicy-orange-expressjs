const omdbRouter = require('express').Router()
const fetch = require('node-fetch');
const apiKey = process.env.OMDB_KEY

omdbRouter.get('/:query', async (request, response) => {
  const { query } = request.params
  console.log(query);
  const apiResponse = await fetch(`http://www.omdbapi.com/?${query}${apiKey}`)
  const json = await apiResponse.json()
  console.log(json);
  response.json(json)
})

module.exports = omdbRouter