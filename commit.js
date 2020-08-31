const { requestServer, convertToApiApproveUrl } = require('./common')

const data = require('./data')
const url = process.argv[2]

const apiUrl = convertToApiApproveUrl(url)
if (!apiUrl) {
  console.error(`URL ${url} is not a correct PR overview page`)
  return
}

console.log('Committing', data.username, apiUrl)
requestServer('/commit', {
  method: 'POST',
  json: {
    username: data.username,
    url: apiUrl
  }
}, function(err, httpResponse, body) {
  if (err) {
    return console.error('Commit failed:', err)
  }
  console.log('Committed successfully!')
})
