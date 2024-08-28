import  { createContext, useState, useContext } from 'react';

// Crie o contexto
const focusContext = createContext();

// Crie o provider para o contexto
export const FocusProvider = ({ children }) => {  // 'children' são os componentes filhos que terão acesso ao contexto
    const [focus, setfocus] = useState('home');

  return (
    <focusContext.Provider value={{focus,setfocus}}>
      {children} 
    </focusContext.Provider>
  );
};

// Hook para usar o contexto
export const useFocus = () => useContext(focusContext);
