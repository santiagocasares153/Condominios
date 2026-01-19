import React, { useState } from "react";

const Whattsap: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "other", text: "Hola 👋, ¿ya pagaste la cuota del mes?" },
    { id: 2, sender: "me", text: "Sí, lo hice ayer por transferencia ✅" },
    { id: 3, sender: "other", text: "Perfecto, gracias 🙏" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "me", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-green-50 dark:bg-gray-900 rounded-lg shadow-inner">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-xs text-sm shadow-md ${
                msg.sender === "me"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Entrada de texto */}
      <div className="flex items-center gap-2 border-t border-gray-300 dark:border-gray-700 p-3 bg-gray-100 dark:bg-gray-800">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-full bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Whattsap;
