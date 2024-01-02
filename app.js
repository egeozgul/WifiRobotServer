const express = require('express');
const app = express();
const server = require('http').Server(app);
const url = require('url');

const WebSocket = require('ws');

const port = 3000;

const express_config= require('./config/express.js');

express_config.init(app);

const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

const wss1B = new WebSocket.Server({ noServer: true });

var cameraArray={};

//esp32cam websocket
wss1.on('connection', function connection(ws) 
{
  ws.on('message', function incoming(message) 
  {
	wss2.clients.forEach(function each(client) 
	{
      if (client.readyState === WebSocket.OPEN) 
	  {
        client.send(message);
      }
    });
  });
});

//esp32cam websocket
wss1B.on('connection', function connection(ws) 
{
  ws.on('message', function incoming(message) 
  {
	wss2.clients.forEach(function each(client) 
	{
      if (client.readyState === WebSocket.OPEN) 
	  {
        client.send(message);
      }
    });
  });
});


//webbrowser websocket
wss2.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	// nothing here should be received
    console.log('received wss2: %s', message);
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
	  console.log(pathname);

  if (pathname === '/jpgstream_serverA') 
  {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
	  console.log('received jpgstream_serverA');

    });
  } 
  else if (pathname === '/jpgstream_client') 
  {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
	  console.log('received jpgstream_client');
    });
  } 
  else if (pathname === '/jpgstream_serverB') 
  {
    wss1B.handleUpgrade(request, socket, head, function done(ws) {
      wss1B.emit('connection', ws, request);
	  console.log('received jpgstream_serverB');
    });
  }
  else 
  {
    socket.destroy();
  }
});



// Access the parse results as request.body
/* app.post('/data', function(request, response)
	{
		console.log("vv");
	}
);
*/

// GET method route
app.post('/data', (req, res) => {
  	//res.render('index', {});
	console.log("pressed");
	
	var jsonString = '';
	
	req.on('data', function (data) 
	{
		jsonString += data;
    });

    req.on('end', function () 
	{
		
		var data = JSON.parse(jsonString);
		
		console.log(data);	
		
			wss1.clients.forEach(function each(client) 
			{
			  if (client.readyState === WebSocket.OPEN) 
			  {
				client.send(jsonString);
			  }
			});
			
			wss1B.clients.forEach(function each(client) 
			{
			  if (client.readyState === WebSocket.OPEN) 
			  {
				client.send(jsonString);
			  }
			});
			console.log(jsonString);

			
		console.log(data);
    });
	
	return res.redirect("/");
});

// GET method route
app.get('/', (req, res) => {
  	res.render('index', {});
});

server.listen(port, () => {
	  console.log(`App listening at http://localhost:${port}`)
})

