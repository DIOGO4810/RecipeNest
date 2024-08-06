import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils'; // Ajuste o caminho conforme necessário
import { getDb } from '../baseDeDados/database';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    try {
      const db = getDb();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM recipes WHERE category = ?',
          ['refeicao'],
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

  //Better useEffect
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
          - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity} gramas`} {ingredient.unit === "Null" ? '' : `${ingredient.unit} unidades`})
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      {recipes.length === 0 ? (
        <Text>Nenhuma receita disponível.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  recipeItem: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '90%',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default HomeScreen;
