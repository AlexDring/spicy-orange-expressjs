const supertest = require('supertest')
const mongoose = require('mongoose')
const { initialMedia, upMovie } = require('../tests/media_helper')
const app = require('../app')
const api = supertest(app)

const Media = require('../models/media')
const MediaDetail = require('../models/mediaDetail')
const User = require('../models/user')

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

describe('when media is posted to the api', () => {
  
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
  test('if the media id is included in the url, the media details field is populated by the relevant mediaDetail document', async () => {
    let media = await Media.find({})

    const inception = await api.get(`/api/media/${media[0]._id}`)

    expect(inception.body.Title).toEqual('Inception')
    expect(inception.body.mediaDetail.imdbID).toEqual('tt1375666')
  })
})

describe('when a review is posted to the api', () => {
  beforeEach(async () => {
    let media = await Media.find({})

    const jokerReview = {
      mediaDetailId: `${media[1].mediaDetail}`,
      mediaId: `${media[1]._id}`,
      title: "Joker",
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      user: "Dank1",
      avatar: "test.jpg",
      score: 123,
      review: "not niceeee" 
    }
    await api
      .post(`/api/media/${media[1].mediaDetail}/review`)
      .send(jokerReview)
      .expect(201)
  })
  test('it is embedded on the relevant mediaDetail document', async () => {
    let media = await Media.find({})

    const inceptionReview = {
      user: 'Testing',
      avatar: "testing.jpeg",
      score: 876,
      review: "Great!!"
    }
    await api
      .post(`/api/media/${media[0].mediaDetail}/review`)
      .send(inceptionReview)
      .expect(201)

    const mediaDetailAtEnd = await MediaDetail.find({})
    const review = mediaDetailAtEnd[0].rottenReviews.map(r => r)

    expect(review[0].user).toEqual('Testing')
    expect(review[0].review).toEqual('Great!!')
    expect(review[0].score).toEqual(876)
  })
  test('it can be edited', async () => {
    let media = await Media.find({})

    let joker = await api.get(`/api/media/${media[1]._id}`)

    const jokerReview = {
      mediaDetailId: `${joker.body.mediaDetail._id}`,
      reviewId: `${joker.body.mediaDetail.rottenReviews[0]._id}`,
      score: 726,
      review: "A little better on second viewing"
    }
    await api
      .put(`/api/media/${media[1].mediaDetail}/review`)
      .send(jokerReview)
      .expect(201)

    const mediaDetailAtEnd = await MediaDetail.find({})
    const review = mediaDetailAtEnd[1].rottenReviews.map(r => r)

    expect(review[0].review).toEqual('A little better on second viewing')
    expect(review[0].score).toEqual(726)
  })

  test('it can be deleted', async () => {
    let media = await Media.find({})
    let mediaDetail = await MediaDetail.find({})

    await api
      .delete(`/api/media/${media[1].mediaDetail}/review`)
      .send({
        mediaDetailId: `${mediaDetail[1]._id}`,
        reviewId: `${mediaDetail[1].rottenReviews[0]._id}`
      })
      .expect(204)

    const mediaDetailAtEnd = await MediaDetail.find({})
    expect(mediaDetailAtEnd[1].rottenReviews.length).toEqual(0)  
  })
  test('the review count and average is posted to the relevant media document', async () => {
    let media = await Media.find({})

    const jokerReview = {
      mediaDetailId: `${media[1].mediaDetail}`,
      mediaId: `${media[1]._id}`,
      title: "Joker",
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      user: "Dank4",
      avatar: "test.jpg",
      score: 768,
      review: "niceeee" 
    }

    await api
    .post(`/api/media/${media[1].mediaDetail}/review`)
    .send(jokerReview)
    .expect(201)

    const mediaAtEnd = await Media.find({})
    console.log(mediaAtEnd, 'mediamediamedia');
    expect(mediaAtEnd[1].rottenAverage).toEqual(445.5)  
    expect(mediaAtEnd[1].rottenCount).toEqual(2)  
  })
  test('editing a review also updates the rottenAverage/rottenCount on the relevant media document', async () => {
    let media = await Media.find({})

    const jokerReview = {
      mediaDetailId: `${media[1].mediaDetail}`,
      mediaId: `${media[1]._id}`,
      title: "Joker",
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      user: "Dank4",
      avatar: "test.jpg",
      score: 768,
      review: "niceeee" 
    }

    await api
    .post(`/api/media/${media[1].mediaDetail}/review`)
    .send(jokerReview)
    .expect(201)

    const mediaDetail = await MediaDetail.find({})

    await api
      .put(`/api/media/${mediaDetail[1]._id}/review`)
      .send({
        mediaDetailId: `${mediaDetail[1]._id}`,
        reviewId: `${mediaDetail[1].rottenReviews[1]._id}`,
        score: 999,
        review: "difffeerrent" 
      })
      .expect(201)

    const mediaDetailAfterUpdate = await MediaDetail.find({}) 
    expect(mediaDetailAfterUpdate[1].rottenReviews[1].score).toEqual(999)

    let mediaAfterUpdate = await Media.find({})
    expect(mediaAfterUpdate[1].rottenAverage).toEqual(561)
    expect(mediaAfterUpdate[1].rottenCount).toEqual(2)
  }) 
  test('deleting a review also updates the rottenAverage/rottenCount on the relevant media document', async () => {
    let media = await Media.find({})

    const jokerReview = {
      mediaDetailId: `${media[1].mediaDetail}`,
      mediaId: `${media[1]._id}`,
      title: "Joker",
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      user: "Dank4",
      avatar: "test.jpg",
      score: 768,
      review: "niceeee" 
    }

    await api
    .post(`/api/media/${media[1].mediaDetail}/review`)
    .send(jokerReview)
    .expect(201)

    const mediaDetail = await MediaDetail.find({})

    await api
      .delete(`/api/media/${mediaDetail[1]._id}/review`)
      .send({
        mediaDetailId: `${mediaDetail[1]._id}`,
        reviewId: `${mediaDetail[1].rottenReviews[1]._id}`,
      })
      .expect(204)

    const mediaDetailAfterUpdate = await MediaDetail.find({}) 
    expect(mediaDetailAfterUpdate[1].rottenReviews.length).toEqual(1)

    let mediaAfterUpdate = await Media.find({})
    expect(mediaAfterUpdate[1].rottenAverage).toEqual(123)
    expect(mediaAfterUpdate[1].rottenCount).toEqual(1)
  }) 
})

afterAll(async () => {
  await mongoose.connection.close()
})