// Componentes internos temporales (puedes moverlos a archivos separados luego)
export const ResumenTab = ({ banco }: { banco: any }) => (
  <div className="space-y-4 animate-in fade-in duration-500">
    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Información General</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Banco</p>
        <p className="font-semibold dark:text-white">{banco?.nombre || "N/A"}</p>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">Moneda</p>
        <p className="font-semibold dark:text-white">{banco?.datos?.mondeda || "Bs"}</p>
      </div>
    </div>
  </div>
);
