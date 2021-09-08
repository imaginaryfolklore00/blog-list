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

test('correct amount of blogs returned upon GET request', async () => {
    const response = await api.get('/api/blogs')
    expect(response.type === /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('parameter "id" in every blog is defined', async() => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => blog.id.toBeDefined)
})

test('posted blog is saved correctly', async() => {
    const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 4
    }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)
})

test('if propery "likes" is missing when posting, default likes to zero', async() => {
    const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
    }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)

    const createdBlog = blogsAtEnd[blogsAtEnd.length - 1]
    expect(createdBlog.likes).toEqual(0)
})

test('if properties "url" and "title" are missing when posting, respond with an error', async() => {
    const newBlog = {
        author: "Robert C. Martin"
    }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog is deleted correctly', async() => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
})

test('a blog is updated correctly', async() => {
    const updatedParameters = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 8
    }
    const blogsAtStart = await helper.blogsInDB()
    const blogToUpdate = blogsAtStart[0]

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedParameters)
        .expect(200)
    
    const blogsAtEnd = await helper.blogsInDB()
    const updatedBlog = blogsAtEnd[0]

    const comparedParameters = {
        title: updatedBlog.title,
        author: updatedBlog.author,
        url: updatedBlog.url,
        likes: updatedBlog.likes
    }

    expect(comparedParameters).toEqual(updatedParameters)
})

afterAll(() => {
    mongoose.connection.close()
})