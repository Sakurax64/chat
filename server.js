const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 42069;

let messages = [];
let clients = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/messageStream', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();

	// Send the entire chat history to the new client
	messages.forEach(message => {
		res.write(`data: ${JSON.stringify(message)}\n\n`);
	});

	// Add client to the array
	const client = { id: Date.now(), res };
	clients.push(client);

	// Remove client if disconnected
	req.on('close', () => {
		clients = clients.filter(c => c.id !== client.id);
		res.end();
	});
});

app.post("/sendMessage", (req, res) => {
	const user = req.body.user;
	const text = req.body.message;

	const message = { user, text, timeStamp: new Date().toISOString() };

	messages.push(message);

	// push to all clients
	clients.forEach(client => {
		client.res.write(`data: ${JSON.stringify(message)}\n\n`);
	});

	res.status(200).json({ success: true });
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
});
