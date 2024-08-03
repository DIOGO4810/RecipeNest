import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils'; // Ajuste o caminho conforme necessário
import { getDb } from '../baseDeDados/database';
import { useFocusEffect } from '@react-navigation/native';

const BakeryScreen = () => {
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    try {
      const db = getDb();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM recipes WHERE category = ?',
          ['sobremesa'],
          async (_, { rows }) => {
            const recipes = rows._array.map(recipe => {
              const ingredients = JSON.parse(recipe.ingredients.replace(/\\"/g, '"').replace(/^"|"$/g, ''));
              
              return {
                ...recipe,
                ingredients
              };
            });

            console.log('Iniciando verificação de disponibilidade de ingredientes...');

            const validRecipes = await Promise.all(recipes.map(async (recipe) => {
              console.log(`Verificando receita ${recipe.name} (ID ${recipe.id})...`);
              const isAvailable = await checkIngredientsAvailability(recipe.id);
              console.log(`Disponibilidade para a receita ${recipe.name} (ID ${recipe.id}):`, isAvailable);
              return isAvailable ? recipe : null;
            }));

            console.log('Receitas após verificação de disponibilidade de ingredientes:', validRecipes);

            // Filtrar receitas válidas
            const filteredRecipes = validRecipes.filter(recipe => recipe !== null);

            if (filteredRecipes.length === 0) {
              console.log('Nenhuma receita válida encontrada.');
            } else {
              console.log("Tens algo para comer uuhuhuhuh");
            }

            setRecipes(filteredRecipes);
            console.log('Receitas válidas:', filteredRecipes);
          },
          (tx, error) => {
            console.error('Erro ao buscar receitas:', error);
          }
        );
      });
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.recipeItem}>
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>Tempo de Preparação: {item.preparation_time} minutos</Text>
      <Text>Ingredientes:</Text>
      {item.ingredients.map((ingredient, index) => (
        <Text key={index}>
          - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity}`} {ingredient.unit === "Null" ? '' : `${ingredient.unit}`})
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas de Sobremesa</Text>
      {recipes.length === 0 ? (
        <Text>Nenhuma receita disponível.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  flatListContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  recipeItem: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 20,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default BakeryScreen;
