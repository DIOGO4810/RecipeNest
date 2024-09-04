import  { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navegacao/Appnavigator';
import { initializeDatabase } from './baseDeDados/database';  
import { addInitialRecipes, addRecipe, deleteRecipe, clearRecipesTable, clearIngredientTable,deleteIngredient } from './baseDeDados/dataUtils';
import { VeganProvider } from './Contexts/VeganContext';
import { SearchProvider } from './Contexts/SearchContext';
import { FocusProvider } from './Contexts/FocusContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log("A inicializar a base de dados\n\n\n");
        await initializeDatabase(); // Aguarda a inicialização do banco de dados
        //clearRecipesTable();
        //clearIngredientTable();     // Util para quando se quer mexer na base de dados
        await addInitialRecipes();  // Adiciona receitas após a inicialização
        setIsDatabaseReady(true);   // Atualiza o estado para indicar que a configuração está concluída

      } catch (error) {
        console.error('Erro durante a configuração do banco de dados:', error);
      }
    };

    setupDatabase(); // Chama a função para configurar o banco de dados
  }, []);

  if (!isDatabaseReady) {
    return console.log("Preparando a Data Base"); // Pode ser um componente de carregamento mais sofisticado
  }

  return (
    <FocusProvider>
    <SearchProvider>
    <VeganProvider>
     <NavigationContainer>
     <SafeAreaView style={{ flex: 1 }}>
        <BottomTabNavigator />
      </SafeAreaView>
     </NavigationContainer>
    </VeganProvider>
    </SearchProvider> 
    </FocusProvider>
   
   
    
   
  

  );
}
