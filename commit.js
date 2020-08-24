const request = require('request')
const data = require('./data')
const url = process.argv[2]

const regex_to_extract = '.+\.com/projects/(.+)/repos/(.+)/pull-requests/(.+)/overview'
const matches = url.match(regex_to_extract)
if (!matches) {
  console.error(`URL ${url} is not a correct PR overview page`)
  return
}

const apiPartial = {
  workspace: matches[1],
  repo: matches[2],
  prId: matches[3]
}
const apiUrl = new URL(url)
apiUrl.pathname = `/rest/api/latest/projects/${apiPartial.workspace}/repos/${apiPartial.repo}/pull-requests/${apiPartial.prId}/approve`

console.log('Committing', data.username, apiUrl.href)
request.post({
  url: `https://${data.server}/commit`,
  json: {
    username: data.username,
    url: apiUrl.href
  },
  headers: {
    'Content-Type': 'application/json'
  }
}, function(err, httpResponse, body) {
  if (err) {
    return console.error('Commit failed:', err)
  }
  console.log('Committed successful!')
})
