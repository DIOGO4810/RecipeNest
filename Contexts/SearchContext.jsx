import  { createContext, useState, useContext } from 'react';

// Crie o contexto
const SearchContext = createContext();

// Crie o provider para o contexto
export const SearchProvider = ({ children }) => {  // 'children' são os componentes filhos que terão acesso ao contexto
    const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery,setSearchQuery }}>
      {children} 
    </SearchContext.Provider>
  );
};

// Hook para usar o contexto
export const useSearch = () => useContext(SearchContext);
