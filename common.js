const request = require('request')
const config = require('./config')

const getBitbuketRequestOptions = function() {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (config.proxy) {
        defaultOptions.proxy = `http://${config.proxy.host}:${config.proxy.port}`
    }

    if (config.accessToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${config.accessToken}`
    } else if (config.username) {
        defaultOptions.auth = {
            user: config.username,
            password: config.password
        }
    }

    return defaultOptions
}

const requestBitbucket = function(options, callback) {
    options = {...getBitbuketRequestOptions(), ...options }
    request(options, callback)
}

const requestServer = function(uri, options, callback) {
    const defaultOptions = {
        url: `${config.server}${uri}`,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    options = {...defaultOptions, ...options }
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