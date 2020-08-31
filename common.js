const SocksProxyAgent = require('socks5-https-client/lib/Agent')
const request = require('request')
const config = require('./config')

const requestBitbucket = function(options, callback) {
  const defaultOptions = {
    headers : {
      'Content-Type': 'application/json'
    },
    auth: {
      user: config.username,
      password: config.password
    },
    agentClass: SocksProxyAgent,
    agentOptions: {
      socksHost: config.proxy.host,
      socksPort: config.proxy.port
    }
  }
  options = { ...defaultOptions, ...options }
  request(options, callback)
}

const requestServer = function(uri, options, callback) {
  const defaultOptions = {
    url: `${config.server}${uri}`,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  options = { ...defaultOptions, ...options }
  request(options, callback)
}

const convertToApiApproveUrl = function(url) {
  const regex = '.+\.com/projects/(.+)/repos/(.+)/pull-requests/(.+)/overview'
  const matches = url.match(regex)
  if (!matches) {
    return false
  }

  const apiPartial = {
    workspace: matches[1],
    repo: matches[2],
    prId: matches[3]
  }
  const apiUrl = new URL(url)
  apiUrl.pathname = `/rest/api/latest/projects/${apiPartial.workspace}/repos/${apiPartial.repo}/pull-requests/${apiPartial.prId}/approve`

  return apiUrl.href
}

module.exports = {
  requestBitbucket,
  requestServer,
  convertToApiApproveUrl
}
