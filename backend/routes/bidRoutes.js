const express = require('express');
const WebSocket = require('ws');
const router = express.Router();

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');

        ws.on('message', (message) => {
            console.log('Received WebSocket message:', message);
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    });

    return wss;
}

module.exports = {
    router,
    setupWebSocketServer
};
