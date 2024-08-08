import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
      <Image source={item.image} style={styles.recipeImage} />
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>Tempo de Preparação: {item.preparation_time} minutos</Text>
      <Text>Ingredientes:</Text>
      {item.ingredients.map((ingredient, index) => (
        <Text key={index}>
          - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity} gramas/ml`} {ingredient.unit === "Null" ? '' : `${ingredient.unit} unidades`})
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas de sobremesa</Text>
      {recipes.length === 0 ? (
        <Text>Nenhuma receita disponível.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
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
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeItem: {
    marginVertical: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    width: 300,
    backgroundColor: '#ffccd4',
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recipeImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BakeryScreen;
