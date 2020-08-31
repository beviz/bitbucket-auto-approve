const io = require('socket.io-client')

const config = require('./config')
const { requestBitbucket } = require('./common')

const socket = io(`${config.server}`, { forceNew: true });

socket.on('connect', () => {
  console.log('connected')
})
socket.on('disconnect', () => {
  console.log('disconnected, reconnecting')
})

socket.on("online", onlineCount => {
  console.log('online count: ', onlineCount)
})

socket.on('broadcast', message => {
  if (message.username === config.username) {
    return
  }

  approve(message)
})

const approve = function(message) {
  requestBitbucket({
    method: 'POST',
    url: message.url
  }, function (error, response, body) {
    if (error) {
      return console.error('Approve failed:', error);
    }

    const jsonBody = JSON.parse(body)
    if (jsonBody.errors) {
      return console.error('Approve failed:', jsonBody.errors[0].message);
    }

    console.log(`Approved ${message.username} ${message.url}`);
  })
}
