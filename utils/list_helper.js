const blogsRouter = require("../controllers/blogs")
const blog = require("../models/blog")

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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}