const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})
  
    const userObjects = helper.initialUsers
      .map(user => new User(user))
    const promiseArray = userObjects.map(user => user.save())
    await Promise.all(promiseArray)
})

test('correct amount of users returned upon GET request', async () => {
    const response = await api.get('/api/users')
    expect(response.type === /application\/json/)
    expect(response.body).toHaveLength(helper.initialUsers.length)
})

test('parameter "id" in every user is defined', async() => {
    const response = await api.get('/api/users')
    response.body.forEach(User => User.id.toBeDefined)
})

test('posted user is saved correctly', async() => {
    const newUser = {
        username: "kirby",
        name: "Kirby",
        password: "pink"
    }
    
    await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
})

test('if username or password are invalid, respond with an error', async() => {
    const newUser = {
        username: "kirby",
        name: "Kirby",
        password: "pi"
    }

    const newUser1 = {
        username: "ki",
        name: "Kirby",
        password: "pink"
    }
    
    const res = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(res.body.error).toEqual('password should be at least 3 characters long')

    const res1 = await api
        .post('/api/users')
        .send(newUser1)
        .expect(400)
    
    expect(res1.body.error).toEqual('User validation failed: username: Path `username` (`ki`) is shorter than the minimum allowed length (3).')

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
})

afterAll(() => {
    mongoose.connection.close()
})