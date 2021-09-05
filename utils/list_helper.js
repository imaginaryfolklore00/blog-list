const blogsRouter = require("../controllers/blogs")
const blog = require("../models/blog")
const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => sum + item
    
    return blogs 
    ? blogs.map((blog) => blog.likes).reduce(reducer, 0) 
    : 0
}

const favoriteBlog = (blogs) => {
    const mostLikedBlogs = blogs.filter((blog) => blog.likes === Math.max(...blogs.map((blog) => blog.likes)))
    const firstFavBlog = mostLikedBlogs[0]
    
    const returnedBlog = {
        title: firstFavBlog.title,
        author: firstFavBlog.author,
        likes: firstFavBlog.likes
    }

    return returnedBlog
}

const mostBlogs = (blogs) => {
    const authorsList = blogs.map((blog) => blog.author)
    let maxBlogs = 0
    let maxAuthor = ''
    _.forIn(_.countBy(authorsList), (value, key) => {
        if (value > maxBlogs) { 
            maxBlogs = value
            maxAuthor = key 
        }
    })

    const returnedAuthor = {
        author: maxAuthor,
        blogs: maxBlogs
    }

    return returnedAuthor
}

const mostLikes = (blogs) => {
    const authorsGrouped = _.groupBy(blogs, 'author')
    let maxLikes = 0
    let maxAuthor = ''
    _.forIn(authorsGrouped, (value, key) => {
        let authorLikes = _.sum(value.map((blog) => blog.likes))
        if (authorLikes >= maxLikes) {
            maxLikes = authorLikes
            maxAuthor = key
        }
    })

    const returnedAuthor = {
        author: maxAuthor,
        likes: maxLikes
    }

    return returnedAuthor
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}