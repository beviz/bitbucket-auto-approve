
const
    http = require("http"),
    express = require("express"),
    bodyParser = require('body-parser'),
    socketio = require("socket.io");

const SERVER_PORT = process.env.PORT || 3000;

const regex_to_extract = '.+\.com/projects/(.+)/repos/(.+)/pull-requests/(.+)/overview'



let nextVisitorNumber = 1;
let onlineClients = new Set();

function onNewWebsocketConnection(socket) {
    console.info(`Socket ${socket.id} has connected.`);
    onlineClients.add(socket.id);
    socket.broadcast.emit("online", onlineClients.size);

    socket.on("disconnect", () => {
        onlineClients.delete(socket.id);
        console.info(`Socket ${socket.id} has disconnected.`);
        socket.broadcast.emit("online", onlineClients.size);
    });

    // echoes on the terminal every "hello" message this socket sends
    // socket.on("hello", helloMsg => console.info(`Socket ${socket.id} says: "${helloMsg}"`));
    socket.on("commit", message => {
      console.log('got message', message)
      socket.broadcast.emit("broadcast", message)
    });

    // will send a message only to this socket (different than using `io.emit()`, which would broadcast it)
    socket.emit("welcome", `Welcome! You are visitor number ${nextVisitorNumber++}`);
}

function startServer() {
    // create a new express app
    const app = express();
    // create http server and wrap the express app
    const server = http.createServer(app);
    // bind socket.io to that server
    const io = socketio(server);

    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(bodyParser.urlencoded());
    app.post('/commit', (req, res) => {
      const username = req.body.username
      const url = req.body.url

      console.log('Got commit:', username, url)
      io.emit("broadcast", {
        username: username,
        url: url
      })
      res.json({})
    })

    app.post('/slack_commit', (req, res) => {
      console.log(req.body)
      const url = req.body.text
      const matches = url.match(regex_to_extract)
      if (!matches) {
        error_msg = `URL: ${url} is not a correct PR overview page`
        console.error(error_msg)
        return res.send(error_msg)
      }

      const apiPartial = {
        workspace: matches[1],
        repo: matches[2],
        prId: matches[3]
      }
      const apiUrl = new URL(url)
      apiUrl.pathname = `/rest/api/latest/projects/${apiPartial.workspace}/repos/${apiPartial.repo}/pull-requests/${apiPartial.prId}/approve`

      console.log('Got commit from Slack:', url)
      io.emit("broadcast", {
        username: "slack",
        url: apiUrl.href
      })
      res.send("Done")
    })

    // example on how to serve static files from a given folder
    app.use(express.static("public"));

    // will fire for every new websocket connection
    io.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));
}

startServer();
