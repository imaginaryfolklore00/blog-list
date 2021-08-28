require('dotenv').config()
const http = require('http')
const app = require('./app')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`)
})