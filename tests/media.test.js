const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')
const api = supertest(app)
const { initialMedia, upMovie } = require('../tests/media_helper')


describe('when media is posted to the api', () => {
  let headers 
  
  beforeEach(async () => {
    await User.deleteMany({})
    await Media.deleteMany({})
    await MediaDetail.deleteMany({})

    const newUser = {
      username: "Testing",
      name: "John Doe",
      password: "password"
    }

    await api
    .post('/api/users')
    .send(newUser)

    const result = await api
    .post('/api/login')
    .send(newUser)

    headers = {
      'Authorization': `bearer ${result.body.token}`
    }
    
    await api
      .post('/api/media')
      .send(initialMedia[0])
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
      await api
      .post('/api/media')
      .send(initialMedia[1])
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('it must include a token', async () => {
      await api
      .post('/api/media')
      .send(upMovie)
      .expect(401)
  })
  test('it must include a valid token', async () => {
    let incorrectHeaders = {'Authorization': `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRyaW5nZXIiLCJpZCI6IjYwYjY0NmY4MGY0MzBmYmIxNDBmNGVhOSIsImlhdCI6MTYyMjU1ODQ3OH0.v5JwuFLShIaKrpzoelD8HquSmddLD-NOT-VALID` }
  
    await api
    .post('/api/media')
    .send(upMovie)
    .set(incorrectHeaders)
    .expect(401)
  })
  test('it is saved to the database', async () => {
    await api
      .post('/api/media')
      .send(upMovie)
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/media')

    expect(response.body.length).toEqual(3)
    expect(response.body[2].Title).toEqual('Up')
  })
  test('it should include the users username and id', async () => {
    const result = await api
      .post('/api/media')
      .send(upMovie)
      .set(headers)

      
    const mediaResults = await MediaDetail.find({})
    const user = await User.find({})
      
    expect(result.body.user).toEqual('Testing')
    expect(mediaResults[2].userId).toEqual(user[0]._id.toString())

  })
  test('it includes a ref to the associated MediaDetail document', async () => {
    const result = await api
      .post('/api/media')
      .send(upMovie)
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const mediaResults = await MediaDetail.find({})

    expect(result.body.mediaDetail).toEqual(mediaResults[2]._id.toString())
  })
  test('the Media and MediaDetail documents can be deleted by the user who added the media', async () => {
    const initialMedia = await api.get('/api/media')

    await api.delete(`/api/media/${initialMedia.body[0]._id}`).send({
      mediaId: initialMedia.body[0]._id,
      mediaDetailId: initialMedia.body[0].mediaDetail
    }).set(headers)

    const mediaCollection = await Media.find({})
    const mediaDetailsCollection = await MediaDetail.find({})

    expect(mediaCollection.length).toEqual(1)
    expect(mediaDetailsCollection.length).toEqual(1)
  })
  test('only the person who added the media can delete it', async () => {
    const differentUser = {
      username: "Different User",
      name: "John Though",
      password: "password"
    }

    await api
    .post('/api/users')
    .send(differentUser)

    const result = await api
    .post('/api/login')
    .send(differentUser)

    const differentHeaders = {
      'Authorization': `bearer ${result.body.token}`
    }

    const initialMedia = await api.get('/api/media')

    await api.delete(`/api/media/${initialMedia.body[0]._id}`).send({
      mediaId: initialMedia.body[0]._id,
      mediaDetailId: initialMedia.body[0].mediaDetail
    }).set(differentHeaders).expect(401)

    const mediaCollection = await Media.find({})
    const mediaDetailsCollection = await MediaDetail.find({})

    expect(mediaCollection.length).toEqual(2)
    expect(mediaDetailsCollection.length).toEqual(2)
  })
  test('if the media id is included in the url, the media details field is populate by the relevant mediaDetail document', async () => {
    let media = await Media.find({})
    console.log(media[0].mediaDetail);
    const inception = await api.get(`/api/media/${media[0]._id}`)
    
    expect(inception.body.Title).toEqual('Inception')
    expect(inception.body.mediaDetail).not.toEqual
    expect(inception.body.mediaDetail.imdbID).toEqual('tt1375666')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})