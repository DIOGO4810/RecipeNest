import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
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

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.recipeItem}>
        <Image source={item.image} style={styles.recipeImage} />
        <Text style={styles.recipeName}>{item.name}{'\n'}</Text>
        <Text style={styles.biggerStext}>Tempo de preparação: {item.preparation_time} minutos</Text>
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
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          {/* Fundo com opacidade fixa */}
          <TouchableOpacity style={styles.modalBackground} onPress={closeModal}>
            <View style={styles.modalBackground} />
          </TouchableOpacity>
          
          
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Image source={selectedRecipe.image} style={styles.modalRecipeImage} />

            <Text style={styles.modalRecipeName}>{selectedRecipe.name}</Text>


            <Text style={styles.Mtitle} >Tempo de Preparação: {selectedRecipe.preparation_time} minutos {'\n'}</Text>
            <Text style={styles.biggerLtext} >{selectedRecipe.description}</Text>
            <Text style={styles.Mtitle}>Ingredientes:</Text>
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.biggerStext}>
                - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity} gramas`} {ingredient.unit === "Null" ? '' : `${ingredient.unit} unidades`})
              </Text>
            ))}
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
  },Stitle: {
    fontSize: 14,
    fontWeight: 'bold',
    margin: 20,
  },Mtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop:10,
    marginLeft: 6,
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
    backgroundColor: '#ffeb99', // Cor de fundo da receita
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
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff8dc', // Cor de fundo do model da receita que normalmente um bocado mais claro que o da receita em si
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 3, // Certifica-se de que o botão "X" esteja sobreposto ao conteúdo
  },
  closeButtonText: {
    color: '#000', // Cor preta para o texto
    fontWeight: 'bold',
    fontSize: 20, // Tamanho de fonte ajustado para uma aparência de "cruz"
  },
  modalRecipeImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 10,
  },
  modalRecipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  biggerLtext: {
    fontSize:18 
   },

   biggerMtext:{
    fontSize:18,
    alignSelf: 'flex-start',  // Alinha o texto à esquerda
    marginTop: 10,
   },
   biggerStext:{
    fontSize:16
   }

});

export default HomeScreen;
