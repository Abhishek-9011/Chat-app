"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let userCount = 0;
let allSockets = [];
wss.on("connection", (socket) => {
    userCount = userCount + 1;
    console.log("No. of usffers " + userCount);
    socket.on("message", (message) => {
        var _a;
        const parsedMessge = JSON.parse(message);
        if (parsedMessge.type === "join") {
            allSockets.push({ socket, room: parsedMessge.payload.roomId });
        }
        if (parsedMessge.type === "chat") {
            const currentUserRoom = (_a = allSockets.find((x) => x.socket === socket)) === null || _a === void 0 ? void 0 : _a.room;
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].room == currentUserRoom) {
                    allSockets[i].socket.send(parsedMessge.payload.message);
                }
            }
        }
    });
    socket.on("disconnect", () => { });
});
