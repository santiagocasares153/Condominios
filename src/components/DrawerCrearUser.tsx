import React from 'react';

interface DrawerCrearUserProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawerCrearUser: React.FC<DrawerCrearUserProps> = ({ isOpen, setIsOpen }) => {
  
  // Clases comunes para inputs y labels
  const inputClasses = "w-full p-2 border rounded-md transition-colors text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    // Contenedor principal del Drawer: Fondo blanco por defecto, oscuro en dark mode.
    // Sombra adaptativa.
    <div
      className={`fixed top-0 right-0 w-80 h-full shadow-lg p-6 transition-all duration-300 ease-in-out transform 
        bg-white dark:bg-gray-800 dark:border-l dark:border-gray-700 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ zIndex: 50 }} // Asegura que esté por encima del contenido principal
    >
      {/* Opcional: Podrías añadir un overlay oscuro fuera del drawer si quisieras, 
          pero lo dejamos fuera para solo enfocar en el componente del drawer. 
      */}

      {isOpen && (
        <div>
          {/* Botón de cerrar: Color de texto adaptativo y hover */}
          <button
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100"
            onClick={() => setIsOpen(false)}>
            ✕
          </button>
          
          {/* Título: Color de texto adaptativo */}
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Agregar Usuario</h2>
          
          <form className="space-y-4">
            <div>
              <label className={labelClasses}>Nombre</label>
              <input
                type="text"
                className={inputClasses}
                placeholder="Ingrese el nombre"
              />
            </div>
            <div>
              <label className={labelClasses}>Correo</label>
              <input
                type="email"
                className={inputClasses}
                placeholder="Ingrese el correo"
              />
            </div>
            
            {/* Botón de Guardar: Los colores fijos (blue-500/white) generalmente no necesitan dark: */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
              Guardar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DrawerCrearUser;