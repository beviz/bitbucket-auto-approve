const { requestBitbucket, requestServer } = require('./common')
const bitbucketHost = process.argv[2]

const checkBitbucketConfig = function() {
  requestBitbucket({
    method: 'GET',
    url: `${bitbucketHost}/rest/api/latest/profile/recent/repos`
  }, function (error, response, body) {
    if (error) {
      return console.error('Invalid config, please check', error);
    }

    const jsonBody = JSON.parse(body)
    if (jsonBody.errors) {
      return console.error('Invalid bitbucket config:', jsonBody.errors[0].message);
    }

    console.log('Your bitbucket config is valid!');
  })
}

const checkServerConfig = function() {
  requestServer('/hi', {}, function(err, httpResponse, body) {
    if (err) {
      return console.error('Invalid server config:', err)
    }

    const jsonBody = JSON.parse(body)
    if (jsonBody.message !== 'Hallelujah!') {
      return console.error('Invalid server response', body)
    }

    console.log('Your server config is valid!')
  })
}

checkServerConfig()
checkBitbucketConfig()
