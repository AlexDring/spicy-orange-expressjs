const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
//The test imports the Express application from the app.js module and wraps it with the supertest function into a so-called superagent object. This object is assigned to the api variable and tests can use it for making HTTP requests to the backend. - https://fullstackopen.com/en/part4/testing_the_backend
const api = supertest(app)

test('media results are returned as json', async () => {
  await api
  .get('/api/omdb/s=inception')
  .expect(200)
  .expect('Content-Type', /application\/json/)
})

test('the first result is inception with correct imdbId', async () => {
  const response = await api.get('/api/omdb/s=inception')

  expect(response.body.Search[0].Title).toBe('Inception')
  expect(response.body.Search[0].imdbID).toBe('tt1375666')
})

test('searching using the imdbID returns an individual media item', async () => {
  const response = await api.get('/api/omdb/i=tt1375666&plot=full')

  expect(response.body.Title).toBe('Inception')
  expect(response.body.Runtime).toBe('148 min')
  expect(response.body.Ratings).toHaveLength(3)
})

afterAll(async () => {
  await mongoose.connection.close()
})