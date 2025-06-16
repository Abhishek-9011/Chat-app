import React, { useEffect, useRef, useState } from "react";

const ChatPage = () => {
  const [messages, setMessages] = useState(["hi there"]);
  const wsRef = useRef();
  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");
    ws.onmessage = (event) => {
      setMessages((m) => [...m, event.data]);
    };
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "123",
          },
        })
      );
    };
  },[]);
  return (
    <div className="h-screen bg-black">
      <div className="h-[90vh] bg-red-400 text-white">
        {messages.map((message) => (
          <div>{message}</div>
        ))}
      </div>
      <div className="w-full bg-white  p-4 flex">
        <input id="message" className="flex-1" type="text" />
        <button
          onClick={() => {
            //@ts-ignore
            const message = document.getElementById("message")?.value;
            wsRef.current.send(
              JSON.stringify({
                type: "chat",
                payload: {
                  message: message,
                },
              })
            );
          }}
          className="bg-purple-600 text-white p-4"
        >
          send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
