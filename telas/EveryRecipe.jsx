import  { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect,useNavigation } from '@react-navigation/native';
import { useSearch } from '../Contexts/SearchContext';
import { useFocus } from '../Contexts/FocusContext';

const EveryRecipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {searchQuery} = useSearch();
  const {setfocus} = useFocus();
  const navigation = useNavigation();

 
    const fetchRecipes = () => {
      const db = getDb();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM recipes ', 
          [],
          (_, { rows }) => {
            const fetchedRecipes = rows._array.map(recipe => {
              const ingredients = JSON.parse(recipe.ingredients.replace(/\\"/g, '"').replace(/^"|"$/g, ''));
              return {
                ...recipe,
                ingredients
              };
            });
            const filteredRecipes = fetchedRecipes.filter(recipe =>
              recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setRecipes(filteredRecipes);          
          },
          (tx, error) => {
            console.error('Erro ao buscar receitas', error);
          }
        );
      });
    };

    useFocusEffect(
      useCallback(() => {
        fetchRecipes();
        setfocus('Home')
      }, [searchQuery,navigation]) 
      );
  



  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };



  const renderItem = ({ item }) => {
    // Define as cores com base nas categorias
    const backgroundColor = item.category === 'refeicao'
      ? '#ffeb99' // Cor para refeições
      : item.category === 'sobremesa'
      ? '#ffcccc' // Cor para sobremesas
      : '#d3d3d3'; // Cor padrão para outras categorias
  
    return (
      <TouchableOpacity onPress={() => openModal(item)}>
        <View style={[styles.recipeItem, { width: 160, backgroundColor }]}>
          <Image source={item.image} style={[styles.recipeImage, { width: 100, height: 100 }]} />
          <Text style={styles.recipeName}>{item.name}{'\n'}</Text>
          <Text style={styles.biggerStext}>Tempo de preparação: {item.preparation_time} minutos</Text>
          <Text style={styles.biggerStext}>Calorias: {item.calories} kcal</Text>
        </View>
      </TouchableOpacity>
    );
  };

    // Render do cabeçalho
    const renderHeader = () => (
      <View style={styles.subHeader}>
      <Text style={styles.title}>Receitas</Text>
      
    </View>
    );
  

  return (
    <View style={styles.container}>
    
     
      
        <FlatList
         ListHeaderComponent={renderHeader}
          numColumns={2}
          data={recipes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
        />
      

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

    {/* Cor de fundo dinâmica baseada na categoria */}
    <View style={[styles.modalContent, { backgroundColor: 
      selectedRecipe.category === 'refeicao' 
        ? '#ffeb99' 
        : selectedRecipe.category === 'sobremesa'
        ? '#ffcccc' 
        : '#fff8dc' }]}>
      
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

export default EveryRecipe;
