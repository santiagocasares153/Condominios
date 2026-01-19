import  { useState, useEffect, SetStateAction } from 'react';

// Componente `Notificacion` que maneja toda la lógica de notificaciones
const Notificacion = () => {
  // Estado para el mensaje de notificación dentro de la app
  const [appMessage, setAppMessage] = useState('');
  // Estado para verificar si las notificaciones son compatibles con el navegador
  const [isSupported, setIsSupported] = useState(false);
  // Estado para el estado de los permisos de notificación
  const [permissionStatus, setPermissionStatus] = useState('default');
  // Estado para el modal de mensajes personalizados
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Efecto para verificar el soporte y el estado de los permisos al cargar el componente
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Muestra un modal personalizado en lugar de la función alert()
  const showCustomModal = (message: SetStateAction<string>) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Cierra el modal personalizado
  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Solicita permiso para mostrar notificaciones
  const requestPermission = async () => {
    if (!isSupported) {
      showCustomModal("Las notificaciones no son compatibles con tu navegador.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    } catch (error) {
      console.error("Error al solicitar permiso de notificación:", error);
    }
  };

  // Simula una llamada a una API para obtener el mensaje de la notificación
  const fetchNotificationMessageFromAPI = () => {
    return new Promise((resolve, ) => {
      // Simula un retraso de 1.5 segundos en la red
      setTimeout(() => {
        // En un entorno real, aquí harías una petición fetch()
        const apiResponse = {
          message: "¡Esta es una notificación push de escritorio enviada desde una API!",
          title: "Actualización Importante"
        };
        resolve(apiResponse);
      }, 1500);
    });
  };

  // Muestra una notificación en la aplicación y una notificación de escritorio
  const showNotification = async () => {
    try {
      // Obtener el mensaje de la "API" de forma asíncrona
      const apiData = await fetchNotificationMessageFromAPI() as { message: string; title: string };
      
      // Actualizar el estado para la notificación en la app
      setAppMessage(apiData.message);

      if (permissionStatus === 'granted') {
        const title = apiData.title;
        const options = {
          body: apiData.message,
          icon: 'https://placehold.co/128x128/FF6347/FFFFFF?text=🔔'
        };
        new Notification(title, options);
      }
    } catch (error) {
      console.error("Error al obtener el mensaje de la API:", error);
      showCustomModal("Error al obtener el mensaje de la notificación.");
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center border-2 border-gray-700">
      <h1 className="text-3xl font-bold mb-4 text-gray-200">Notificaciones Push</h1>
      <p className="text-lg text-gray-400 mb-6">
        Ejemplo de notificaciones en la aplicación y en el escritorio.
      </p>

      {/* Muestra el estado actual de los permisos */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500">Estado del Permiso:</p>
        <span
          className={`font-semibold text-lg px-3 py-1 rounded-full ${
            permissionStatus === 'granted' ? 'bg-green-600 text-white' :
            permissionStatus === 'denied' ? 'bg-red-600 text-white' :
            'bg-yellow-600 text-white'
          }`}
        >
          {permissionStatus === 'granted' ? 'Permitido' :
           permissionStatus === 'denied' ? 'Denegado' :
           'Por Defecto'}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="space-y-4">
        {permissionStatus !== 'granted' && (
          <button
            onClick={requestPermission}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg shadow-md hover:bg-purple-700 transition-colors"
          >
            Solicitar Permiso de Notificación
          </button>
        )}
        <button
          onClick={showNotification}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Enviar Notificación
        </button>
      </div>

      {/* Muestra la notificación en la aplicación */}
      {appMessage && (
        <div className="mt-8 bg-green-500 text-white py-4 px-6 rounded-lg font-medium animate-fade-in-up">
          {appMessage}
        </div>
      )}

      {/* Modal personalizado para mensajes */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Notificación</h2>
            <p className="text-gray-400 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificacion;