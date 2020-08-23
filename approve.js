const SocksProxyAgent = require('socks5-https-client/lib/Agent')
const request = require('request')
const io = require('socket.io-client')

const data = require('./data')

const socket = io(`wss://${data.server}`, { forceNew: true });
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
  if (message.username === data.username) {
    return
  }

  approve(message)
})

const approve = function(message) {
  request.post({
    url: message.url,
    headers : {
      'Content-Type': 'application/json'
    },
    auth: {
      user: data.username,
      password: data.password
    },
    agentClass: SocksProxyAgent,
    agentOptions: {
      socksHost: data.proxy.host,
      socksPort: data.proxy.port
    }
  }, function (error, response, body) {
    if (error) {
      return console.error('Approve failed', error);
    }
    console.log(`Approved ${message.username} ${message.url}`);
  })
}
