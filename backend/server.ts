import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';

interface Room {
  queue: string[];
  currentVideo: string | null;
}

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from the React app
    methods: ["GET", "POST"]
  }
});

const rooms: Record<string, Room> = {}; // Store rooms with their video queues

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  // Join a specific room
  socket.on('join-room', (room: string) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { queue: [], currentVideo: null };
    }
    io.to(socket.id).emit('load-queue', rooms[room].queue);
  });

  // Handle adding videos to the queue
  socket.on('add-video', (room: string, videoId: string) => {
    if (rooms[room]) {
      rooms[room].queue.push(videoId);
      io.to(room).emit('update-queue', rooms[room].queue);
    }
  });

  // Handle play/pause events
  socket.on('play-video', (room: string) => {
    io.to(room).emit('play-video');
  });

  socket.on('pause-video', (room: string) => {
    io.to(room).emit('pause-video');
  });

  socket.on('seek-video', (room: string, time: number) => {
    io.to(room).emit('seek-video', time);
  });

  socket.on('next-video', (room: string) => {
    if (rooms[room] && rooms[room].queue.length > 0) {
      rooms[room].currentVideo = rooms[room].queue.shift() || null;
      io.to(room).emit('play-next-video', rooms[room].currentVideo);
      io.to(room).emit('update-queue', rooms[room].queue);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});