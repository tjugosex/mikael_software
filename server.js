// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
let usernmbr = 0;
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins, or specify a list of allowed origins
    methods: ['GET', 'POST'],
  },
});



io.on('connection', (socket) => {
  const clientIpAddress = socket.request.connection.remoteAddress;
  console.log(`A user connected from IP: ${clientIpAddress}`);

  usernmbr += 1;
  console.log('Number of users: ', usernmbr);

  socket.on('disconnect', () => {
    console.log(`User at IP ${clientIpAddress} disconnected`);
    usernmbr -= 1;
    console.log('Number of users: ', usernmbr);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log(`Message from IP ${clientIpAddress}:`, msg);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, '0.0.0.0', () => { // Add '0.0.0.0' to listen on all network interfaces
  console.log(`Server listening at http://localhost:${port}`);
});