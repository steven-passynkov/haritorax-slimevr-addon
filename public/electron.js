const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { app, BrowserWindow } = require('electron');

const expressApp = express();
expressApp.use(cors()); // Enable CORS
expressApp.use(bodyParser.json());

let clients = [];

// This endpoint handles the SSE connection and keeps track of connected clients
expressApp.get('/data', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// This endpoint handles POST requests to the root of the server
expressApp.post('/', (req, res) => {
  console.log('Received data:', req.body);
  sendData(req.body);
  res.sendStatus(200);
});

// This function can be called whenever there's new data to send
function sendData(data) {
  clients.forEach(client =>
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

expressApp.listen(8000, '0.0.0.0', () => {
  console.log('Express server is listening on port 8000');
});

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

