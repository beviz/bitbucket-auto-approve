const data = require('./data')
if (!data.server.includes('://')) {
  data.server = `https://${data.server}`
}

module.exports = { ...data }
