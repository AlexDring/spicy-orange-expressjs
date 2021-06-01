const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

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
  await api.post('/api/users').send(initialUsers[0])
  await api.post('/api/users').send(initialUsers[1])
})

test('a user can login and will be given a token', async () => {
  const response = await api
    .post('/api/login')
    .send({
      username: "Test1",
      password: "testing123"
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toEqual(
    expect.objectContaining({
    "token": expect.any(String)
  }))
})

test('user not in database can\'t login', async () => {
  const response = await api
  .post('/api/login')
  .send({
    username: 'Not a user',
    password: "testing234"
  })

  expect(response.text).toContain('invalid password or username')
})

test('user can\'t login with incorrect password', async () => {
  const response = await api
  .post('/api/login')
  .send({
    username: 'Test2',
    password: "wrong pass"
  })

  expect(response.text).toContain('invalid password or username')
})

afterAll(async () => {
  await mongoose.connection.close()
})