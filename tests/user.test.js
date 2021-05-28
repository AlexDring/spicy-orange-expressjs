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

afterAll(async () => {
  await mongoose.connection.close()
})