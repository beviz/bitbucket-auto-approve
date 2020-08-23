const io = require('socket.io-client')
const data = require('./data')
// const request = require('request')
const url = process.argv[2]

const regex_to_extract = '.+\.com/projects/(.+)/repos/(.+)/pull-requests/(.+)/overview'
const matches = url.match(regex_to_extract)
if (!matches) {
  console.error(`URL ${url} is not correct PR overview page`)
  return
}

const apiPartial = {
  workspace: matches[1],
  repo: matches[2],
  prId: matches[3]
}
const apiUrl = new URL(url)
apiUrl.pathname = `/rest/api/latest/projects/${apiPartial.workspace}/repos/${apiPartial.repo}/pull-requests/${apiPartial.prId}/approve`

const socket = io(`wss://${data.server}`, { forceNew: true })
socket.on('connect', () => {
  console.log('connected')

  socket.emit('commit', {
    username: data.username,
    url: apiUrl.href
  })
  console.log('Commited:', apiUrl.href)

  socket.disconnect()
})

// request.post({
//   url: `https://${data.server}/commit`,
//   data: {
//     username: data.username,
//     url: apiUrl.href
//   },
//   headers: {
//     'Content-Type': 'application/json'
//   }
// }, function(err, httpResponse, body) {
//   if (err) {
//     return console.error('Commit failed:', err)
//   }
//   console.log('Committed successful!')
// })