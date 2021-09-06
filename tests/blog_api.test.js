const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('correct amount of blogs returned on GET request', async () => {
    const response = await api.get('/api/blogs')
    expect(response.type === /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('parameter "id" in every blog is defined', async() => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => blog.id.toBeDefined)
})

afterAll(() => {
    mongoose.connection.close()
})