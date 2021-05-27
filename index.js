const app = require('./app')
const http = require('http') 
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})

// info on nodeJs creteServer method, http module etc can be found here - https://nodejs.org/en/docs/guides/getting-started-guide/