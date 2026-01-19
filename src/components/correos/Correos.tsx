import React, { useState } from "react";

const Correos: React.FC = () => {
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "Admin",
      title: "Recordatorio de pago",
      content:
        "Estimado propietario, le recordamos que la cuota de mantenimiento vence el **20 de Octubre**. Por favor realice su pago a tiempo.",
      date: "16 Oct 2025, 10:30 AM",
    },
    {
      id: 2,
      sender: "Usted",
      title: "Comprobante de pago",
      content:
        "Adjunto el **comprobante de transferencia** correspondiente al mes de Octubre. Saludos cordiales.",
      date: "16 Oct 2025, 11:00 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setEmails([
      ...emails,
      {
        id: Date.now(),
        sender: "Usted",
        title: "Nuevo mensaje",
        content: newMessage,
        date: new Date().toLocaleString(),
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {emails.map((mail) => (
          <div
            key={mail.id}
            className={`border rounded-lg p-3 shadow-sm ${
              mail.sender === "Usted"
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 ml-auto max-w-[80%]"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 mr-auto max-w-[80%]"
            }`}
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{mail.title}</h3>
            <p
              className="text-sm text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: mail.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {mail.sender} — {mail.date}
            </div>
          </div>
        ))}
      </div>

      {/* Enviar nuevo correo */}
      <div className="flex items-center gap-2 border-t border-gray-300 dark:border-gray-700 p-3">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un nuevo correo..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-20"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors h-fit self-end"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Correos;
