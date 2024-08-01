import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navegacao/Appnavigator';
import { initializeDatabase } from './baseDeDados/database';  
import { addInitialRecipes,addRecipe,deleteRecipe,clearRecipesTable} from './baseDeDados/dataUtils';

export default function App() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log("A inicializar a base de dados");
        await initializeDatabase(); // Aguarda a inicialização do banco de dados
        // clearRecipesTable();     //Util para quando se quer mexer na base de dados
        await addInitialRecipes();  // Adiciona receitas após a inicialização
      } catch (error) {
        console.error('Erro durante a configuração do banco de dados:', error);
      }
    };

    setupDatabase(); // Chama a função para configurar o banco de dados
  }, []);

  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
