const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Profile = require('../models/profile')
const api = supertest(app)

const initialUsers = [
  {
    username: 'Test1',
    name: "Test One",
    password: 'testing123'
  },
  {
    username: 'Test2',
    name: 'Test Two',
    password: 'testing234'
  }
]

beforeEach(async () => {
  await User.deleteMany({})
  await Profile.deleteMany({})
  let userObject = new User(initialUsers[0])
  await userObject.save()
  userObject = new User(initialUsers[1])
  await userObject.save()
})

test('a valid user can be added', async () => {
  const newUser = {
    username: 'Dringer',
    name: 'Alex Dring',
    password: 'Tester123'
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/users')

  expect(response.body).toHaveLength(initialUsers.length + 1)

  const usernames = response.body.map(u => u.username)
  expect(usernames).toContain("Dringer")
})

test('a profile document is also created and referenced on the user document', async () => {
  const newUser = {
    username: 'Dringer',
    name: 'Alex Dring',
    password: 'Tester123'
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/users')

  expect(response.body).toHaveLength(initialUsers.length + 1)
  const profiles = await Profile.find({})

  expect(response.body[response.body.length - 1].profile_id.toString())
  .toEqual(profiles[profiles.length - 1]._id.toString())
})

test('all users can be returned', async () => {
  const newUser = {
    username: 'Add one more user',
    name: 'Alex Dring',
    password: 'Tester123'
  }
  await api.post('/api/users').send(newUser)

  const response = await api.get('/api/users')
  expect(response.body).toHaveLength(3)
})

test('an individual user can be returned', async () => {
  const newUser = {
    username: "Individual",
    name: "John Doe",
    password: "normal"
  }

  const savedUser = await api.post('/api/users').send(newUser)

  const individualUser = await api.get(`/api/users/${savedUser.body._id}`)

  expect(individualUser.body.username).toBe('Individual')
  expect(individualUser.body.name).toBe('John Doe')
})

test('an avatar image can be updated', async () => {
  const response = await api.get('/api/users')
  
  const updatedUser = await api
    .put(`/api/users/${response.body[0]._id}`)
    .send({
      'avatar': 'https://en.wikipedia.org/wiki/Thumb_signal#/media/File:Beijing_bouddhist_monk_2009_IMG_1486.JPG'
    })

  expect(updatedUser.body.avatar).toContain('https://en.wikipedia.org/wiki/Thumb_signal#/media/File:Beijing_bouddhist_monk_2009_IMG_1486.JPG')
})

afterAll(async () => {
  await mongoose.connection.close()
})