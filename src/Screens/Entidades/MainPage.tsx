import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CrearEntidad from "./CrearEntidad";
import Menu from "../../components/Menu";
import TableEntidades from "./TableEntidades";

const MainPage = () => {
  const [view, setView] = useState<"main" | "crear">("main");
  const [usuarioAEditar, setUsuarioAEditar] = useState<any>(null); // Puedes tiparlo si defines bien la interfaz

  const slideVariants = {
    hiddenLeft: { x: "-100%", opacity: 0 },
    hiddenRight: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
    exitLeft: { x: "-100%", opacity: 0, transition: { duration: 0.6 } },
    exitRight: { x: "100%", opacity: 0, transition: { duration: 0.6 } },
  };

  return (
    <div>
      <Menu />
      <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-start bg-gray-100 dark:bg-black pt-10 mt-14">
        <AnimatePresence mode="wait">
          {view === "main" && (
            <motion.div
              key="main"
              variants={slideVariants}
              initial="hiddenLeft"
              animate="visible"
              exit="exitLeft"
              className="w-full flex flex-col items-center"
            >

              <div className="w-full px-4">
             <TableEntidades/>
              </div>
            </motion.div>
          )}

          {view === "crear" && (
            <motion.div
              key="crear"
              variants={slideVariants}
              initial="hiddenRight"
              animate="visible"
              exit="exitRight"
              className="w-full max-w-7xl"
            >
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => {
                    setUsuarioAEditar(null);
                    setView("main");
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
                >
                  Volver
                </button>
              </div>
              <CrearEntidad
                usuario={usuarioAEditar}
                onSuccess={() => {
                  setUsuarioAEditar(null);
                  setView("main");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainPage;
