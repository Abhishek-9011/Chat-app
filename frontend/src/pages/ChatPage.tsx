import React, { useEffect, useRef, useState } from "react";

const ChatPage = () => {
  const [messages, setMessages] = useState(["Welcome to the chat room!"]);
  const [inputValue, setInputValue] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected
  const messagesEndRef = useRef(null);
  const wsRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    
    setConnectionStatus("connecting");
    const ws = new WebSocket("ws://localhost:8080");
    
    ws.onmessage = (event) => {
      setMessages((m) => [...m, event.data]);
    };
    
    wsRef.current = ws;
    
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: roomId,
          },
        })
      );
      setJoined(true);
      setConnectionStatus("connected");
      setMessages((m) => [...m, `✓ Joined room: ${roomId}`]);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
      setMessages((m) => [...m, "❌ Connection error. Please check if the server is running."]);
    };
    
    ws.onclose = () => {
      setMessages((m) => [...m, "🔌 Connection closed"]);
      setJoined(false);
      setConnectionStatus("disconnected");
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: inputValue,
        },
      })
    );
    setInputValue("");
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setJoined(false);
    setConnectionStatus("disconnected");
    setMessages((m) => [...m, "👋 Left the room"]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ChatFlow
            </h1>
          </div>
          
          {!joined ? (
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter Room ID"
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                disabled={connectionStatus === "connecting"}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                {connectionStatus === "connecting" ? "Connecting..." : "Join Room"}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected" ? "bg-green-400 animate-pulse" : 
                connectionStatus === "connecting" ? "bg-yellow-400 animate-bounce" : 
                "bg-red-400"
              }`}></div>
              <span className="bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                Room: {roomId}
              </span>
              <button
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Leave
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 container mx-auto p-4 overflow-hidden flex flex-col">
        <div className="flex-1 bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-700">
          {joined ? (
            <>
              {/* Messages Container */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        index % 2 === 0 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                          index % 2 === 0
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-700 text-gray-100 border border-gray-600"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t border-gray-700 p-4 bg-gray-750">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">
                  Join a Chat Room
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Connect with others in real-time. Enter a room ID to start your conversation journey.
                </p>
                
                <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 shadow-xl">
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    className="w-full px-4 py-3 mb-4 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!roomId.trim() || connectionStatus === "connecting"}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                  >
                    {connectionStatus === "connecting" ? "Connecting..." : "Join Room"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;