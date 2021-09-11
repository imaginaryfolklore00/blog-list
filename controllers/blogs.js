const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog
    .find({}).populate('user')

  res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', userExtractor, async (req, res) => {
  const body = req.body
  const user = req.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const user = req.user
  const blog = await Blog.findById(req.params.id)

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(req.params.id)
    return res.status(204).end()
  }
  
  res.status(401).json({ error: 'insufficient rights to delete the blog post' })
})

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body
  const user = req.user
  const blog = await Blog.findById(req.params.id)

  const newParameters = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  }

  if (blog.user.toString() === user.id.toString()) {
    const updatedBlog = await Blog.findByIdAndUpdate(blog.id, newParameters, { new: true })
    res.json(updatedBlog.toJSON())
  }

  res.status(401).json({ error: 'insufficient rights to update the blog post' })
})

module.exports = blogsRouter