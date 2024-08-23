import { createContext, useState, useContext } from 'react';

// Crie o contexto
const VeganContext = createContext();

// Crie o provider para o contexto
export const VeganProvider = ({ children }) => {  // 'children' são os componentes filhos que terão acesso ao contexto
  const [isVeganChecked, setIsVeganChecked] = useState(false);

  return (
    <VeganContext.Provider value={{ isVeganChecked, setIsVeganChecked }}>
      {children} 
    </VeganContext.Provider>
  );
};

// Hook para usar o contexto
export const useVegan = () => useContext(VeganContext);
