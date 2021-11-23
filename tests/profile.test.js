const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Profile = require('../models/profile')
const User = require('../models/user')
const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const api = supertest(app)
const { initialMedia } = require('../tests/media_helper')

let headers 
beforeEach(async () => {
  await User.deleteMany({})
  await Profile.deleteMany({})
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
  
  await api
    .post('/api/media')
    .send(initialMedia[1])
    .set(headers)
})

describe('when an watchlist item is posted to the api', () => {
  test('it is saved on the users profile document', async () => {
    const media = await Media.find({})
    const profile = await Profile.find({})
    console.log(profile, 'profile.bodyprofile.bodyprofile.bodyprofile.body', profile[0]._id);

    const result = await api.post(`/api/${profile[0]._id}/watchlist`)
    .send({
      media_id: media[0]._id,
      date_added: "Mon Jun 14 2021 14:18:09 GMT+0100"
    })
    .set(headers)

    console.log(result.body);

  })
})

afterAll( async () => {
  await mongoose.connection.close()
})