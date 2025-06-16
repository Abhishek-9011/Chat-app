import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
interface User {
  socket: WebSocket;
  room: string;
}
let userCount = 0;
let allSockets: User[] = [];
wss.on("connection", (socket) => {
  userCount = userCount + 1;
  console.log("No. of usffers " + userCount);    
  socket.on("message", (message) => {
    const parsedMessge = JSON.parse(message as unknown as string);
    if (parsedMessge.type === "join") {
      allSockets.push({ socket, room: parsedMessge.payload.roomId });
    }
    if (parsedMessge.type === "chat") {
      const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;
      for (let i = 0; i < allSockets.length; i++) {
        if (allSockets[i].room === currentUserRoom) {
          allSockets[i].socket.send(parsedMessge.payload.message);
        }
      }
    }
  });
  socket.on("disconnect", () => {});
});
