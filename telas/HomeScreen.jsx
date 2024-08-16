import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useVegan } from '../Contexts/VeganContext';

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTwoColumn, setIsTwoColumn] = useState(false);
  const { isVeganChecked } = useVegan();

  const navigation = useNavigation();
 
  const fetchRecipes = async () => {
    try {
      const db = getDb();

      db.transaction(tx => {
        let query = 'SELECT * FROM recipes WHERE category = ?';
        let params = ['refeicao'];

        if (isVeganChecked) {
          query += ' AND isVegan = ?';
          params.push(1); // 1 representa receitas vegetarianas
        }

        tx.executeSql(
          query,
          params,
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
    }, [isVeganChecked]) // O filtro vegano é dependência da busca
    );
  

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };


  // Calcula a largura dos itens com base no número de colunas
  const itemWidth = isTwoColumn ? 160: 300;

  const imageWidth = isTwoColumn ? 100 : 200;

  const imageHeight = isTwoColumn ? 100 : 200;

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={[styles.recipeItem, { width: itemWidth }]}>
        <Image source={item.image} style={[styles.recipeImage, { width: imageWidth, height: imageHeight }]} />
        <Text style={styles.recipeName}>{item.name}{'\n'}</Text>
        <Text style={styles.biggerStext}>Tempo de preparação: {item.preparation_time} minutos</Text>
        <Text style={styles.biggerStext}>Calorias: {item.calories} kcal</Text>
      </View>
    </TouchableOpacity>
  );

    // Render do cabeçalho
    const renderHeader = () => (
      <View style={styles.subHeader}>
      <Text style={styles.title}>Receitas</Text>
      <TouchableOpacity
        style={styles.columns}
        onPress={() => setIsTwoColumn(prev => !prev)}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        {isTwoColumn ? 
          <Feather name="square" size={24} color="black" /> :
          <Feather name="grid" size={24} color="black" />
        }
      </TouchableOpacity>
   
    </View>
  );

  return (
    <View style={styles.container}>
    
     
      {recipes.length === 0 ? (
        <View>
        <Text>Nenhuma receita disponível.</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          key={isTwoColumn ? 'two' : 'one'}  // Alterar a key para forçar a nova renderização
          numColumns={isTwoColumn ? 2 : 1}
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

      <Text style={styles.Mtitle}>Tempo de Preparação: {selectedRecipe.preparation_time} minutos {'\n'}</Text>
      <Text style={[styles.biggerLtext,{marginBottom:10}]}>{selectedRecipe.description}</Text>

      {/* Alinhar Ingredientes e Valores Nutricionais em paralelo */}
      <View style={styles.ingredientsContainer}>
        <View style={styles.ingredientsColumn}>
          <Text style={styles.Mtitle}>Ingredientes:</Text>
          {selectedRecipe.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.bbiggerStext}>
              - {ingredient.name} ({ingredient.quantity === "Null" ? '' : `${ingredient.quantity} gramas`} {ingredient.unit === "Null" ? '' : `${ingredient.unit} unidades`})
            </Text>
          ))}
        </View>
        <View style={styles.nutritionalColumn}>
          <Text style={styles.Mtitle}>Valores Nutricionais:</Text>
          <Text style={styles.bbiggerStext}>Calorias: {selectedRecipe.calories} kcal</Text>
          <Text style={styles.bbiggerStext}>Proteínas: {selectedRecipe.protein} g</Text>
          <Text style={styles.bbiggerStext}>Carboidratos: {selectedRecipe.carbs} g</Text>
          <Text style={styles.bbiggerStext}>Gorduras: {selectedRecipe.fats} g</Text>
        </View>
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
    marginLeft:5
  },
  subHeader:{
    flexDirection:'row',
    width: '100%', // Garante que o container ocupe toda a largura disponível
    paddingHorizontal: 10, // Adiciona algum preenchimento horizontal para que o conteúdo não fique colado às bordas
    marginBottom:10

  },
  columns:{
    alignSelf:'flex-end',
    
    marginLeft:180,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ingredientsColumn: {
    flex: 1,
  },
  nutritionalColumn: {
    flex: 1,
    paddingLeft: 10,
  
    
  },

  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeItem: {
    margin:10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#ffeb99', // Cor de fundo da receita
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recipeImage: {
    borderRadius: 20,
    marginVertical: 10,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff8dc', // Cor de fundo do modal da receita
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
    fontSize: 18,
    alignSelf:'flex-start'
  },
  biggerStext: {
    fontSize: 16,
    alignSelf:'flex-start'

  }, bbiggerStext: {
    fontSize: 16,
    alignSelf:'flex-start',
    

  },
  Mtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',

  },

});

export default HomeScreen;
