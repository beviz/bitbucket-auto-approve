(function() {
  const socket = io(null, { forceNew: true });
  socket.on('connect', () => {
    console.log('connected')
  })
  socket.on('disconnect', () => {
    console.log('disconnected, reconnecting')
  })

  const onlineCountElement = document.getElementById("online_count")
  socket.on("online", online => onlineCountElement.innerText = online.toString());

  const commitLog = []

  const log = (message) => {
    const logsElement = document.getElementById("logs")
    const logElement = document.createElement("LI")
    logElement.innerHTML = `${message} <span class="text-muted">${new Date().toLocaleString()}</span>`
    logsElement.prepend(logElement)
  }

  const isPrPage = (message) => {
    return message.includes('bitbucket') && message.includes('pull-requests')
  }


  const urlElement = document.getElementById('url')
  const usernameElement = document.getElementById('username')
  const storedUsername = localStorage.getItem('username')
  if (storedUsername) {
    usernameElement.value = storedUsername
  }

  socket.on('broadcast', message => {
    message = JSON.parse(message)
    if (commitLog.includes(message.url)) {
      return
    }

    if (!isPrPage(message.url)) {
      return
    }

    const autoApproveUrl = new URL(message.url);
    autoApproveUrl.searchParams.append('autoApprove', 'true')

    const prPage = window.open(autoApproveUrl.href)
    setTimeout(function() {
      prPage.close()
    }, 3000)
    log(`<strong class="text-success">Approved</strong> ${message.username} <a href="${message.url}">${message.url}</a>`)
  })

  const validate = () => {
    if (usernameElement.value.trim() === '') {
      usernameElement.focus()
      return false
    }

    const url = urlElement.value.trim()
    if (url === '' || !isPrPage(url)) {
      urlElement.focus()
      return false
    }

    return true
  }

  document.getElementById('form').onsubmit = () => {
    if (!validate()) {
      return false
    }

    const url = urlElement.value
    const username = usernameElement.value
    localStorage.setItem('username', username)

    const message = {
      username: username,
      url: url
    }

    socket.emit("commit", JSON.stringify(message))
    commitLog.push(url)
    log(`<strong class="text-default">Committed</strong> <a href="${url}" target="_blank">${url}<a>`)

    urlElement.value = ''

    return false
  }
})()
