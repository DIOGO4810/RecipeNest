import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Button } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

            const validRecipes = await Promise.all(recipes.map(async (recipe) => {
              const isAvailable = await checkIngredientsAvailability(recipe.id);
              return isAvailable ? recipe : null;
            }));

            const filteredRecipes = validRecipes.filter(recipe => recipe !== null);

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

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setSelectedRecipe(item);
      setModalVisible(true);
    }}>
      <View style={styles.recipeItem}>
        <Image source={item.image} style={styles.recipeImage} />
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text>{item.description}</Text>
        <Text>        </Text>
      </View>
    </TouchableOpacity>
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
          contentContainerStyle={styles.flatListContent}
        />
      )}

      {selectedRecipe && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={selectedRecipe.image} style={styles.recipeImage} />
              <Text style={styles.recipeName}>{selectedRecipe.name}</Text>
              <Text>{selectedRecipe.description}</Text>
              <Text>Tempo de Preparação: {selectedRecipe.preparation_time} minutos</Text>
              <Text>Ingredientes:</Text>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <Text key={index}>
                  - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity} gramas/ml`} {ingredient.unit === "Null" ? '' : `${ingredient.unit} unidades`})
                </Text>
              ))}
              <Button style={styles.padd} title="Fechar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#ffe680', //Cor de fundo da receita
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  padd: {
    padding:10,
    margin: 20,
  }
});

export default HomeScreen;
