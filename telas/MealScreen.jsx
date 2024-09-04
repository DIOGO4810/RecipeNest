import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVegan } from '../Contexts/VeganContext';
import { useSearch } from '../Contexts/SearchContext';
import { useFocus } from '../Contexts/FocusContext';

const MealScreen = ({ navigation }) => {
  // Estados
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTwoColumn, setIsTwoColumn] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);

  // Contextos
  const { isVeganChecked, setIsVeganChecked } = useVegan();
  const { setfocus } = useFocus();
  const { searchQuery } = useSearch();

  // Função para buscar receitas
  const fetchRecipes = async () => {
    try {
      const db = getDb();
      db.transaction((tx) => {
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
            const recipes = rows._array.map((recipe) => ({
              ...recipe,
              ingredients: JSON.parse(recipe.ingredients.replace(/\\"/g, '"').replace(/^"|"$/g, ''))
            }));

            const validRecipes = await Promise.all(
              recipes.map(async (recipe) => {
                const isAvailable = await checkIngredientsAvailability(recipe.id);
                return isAvailable ? recipe : null;
              })
            );

            const filteredRecipesWithoutSearch = validRecipes.filter((recipe) => recipe !== null);
            const filteredRecipes = filteredRecipesWithoutSearch.filter((recipe) =>
              recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setRecipeCount(filteredRecipesWithoutSearch.length);
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

  // Efeito de foco
  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
      setfocus('Meals');
    }, [isVeganChecked, searchQuery, navigation])
  );

  // Funções de modal
  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Função para alternar filtro vegano
  const handleVeganCheck = () => {
    setIsVeganChecked((prevState) => !prevState);
  };

  // Função para renderizar itens da lista
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={[styles.recipeItem, { width: isTwoColumn ? 160 : 300 }]}>
        <Image source={item.image} style={[styles.recipeImage, { width: isTwoColumn ? 100 : 200, height: isTwoColumn ? 100 : 200 }]} />
        <Text style={styles.recipeName}>
          {item.name}{'\n'}
        </Text>
        <Text style={styles.biggerStext}>Tempo de preparação: {item.preparation_time} minutos</Text>
        <Text style={styles.biggerStext}>Calorias: {item.calories} kcal</Text>
      </View>
    </TouchableOpacity>
  );

  // Render do cabeçalho
  const renderHeader = () => (
    <View>
      <View style={styles.subHeader}>
        <Text style={[styles.title, { marginBottom: 5 }]}> Receitas </Text>
        <Custom label="Vegan" isChecked={isVeganChecked} onCheck={handleVeganCheck} />
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.subTitle, { marginTop: 5 }]}>Disponíveis: {recipeCount}</Text>
        <TouchableOpacity
          style={{ marginBottom: 10, marginRight: 15 }}
          onPress={() => setIsTwoColumn((prev) => !prev)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          {isTwoColumn ? (
            <MaterialCommunityIcons name="table-column" size={28} color="black" />
          ) : (
            <Feather name="grid" size={28} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Novo componente de mensagem sem receitas disponíveis
  const renderNoRecipes = () => (
    <View style={styles.noRecipesContainer}>
      <MaterialCommunityIcons name="emoticon-sad-outline" size={50} color="#555" />
      <Text style={styles.noRecipesText}>
        Nenhuma receita disponível. Para ver receitas, adicione ingredientes na página de ingredientes!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <View>
          {renderHeader()}
          {renderNoRecipes()}
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          key={isTwoColumn ? 'two' : 'one'} // Alterar a key para forçar a nova renderização
          numColumns={isTwoColumn ? 2 : 1}
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
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
            <Text style={[styles.biggerLtext, { marginBottom: 10 }]}>{selectedRecipe.description}</Text>

         
              <View style={styles.ingredientsColumn}>
                <Text style={styles.Mtitle}>Ingredientes:</Text>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <View  key={index} style={{flexDirection:'row'}}>
                  <Text style={styles.bbiggerStextT}>
                    {'> '} {ingredient.name}{'\t'} </Text>
                   <Text  style={styles.bbiggerStext}>- {`${ingredient.quantity} gramas ou ${ingredient.unit} unidades`}
                  </Text>
                  </View>
                ))}
              </View>
          <View style={styles.nutritionalColumn}>
            <Text style={styles.Mtitle}>Valores Nutricionais:</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.bbiggerStextT}>Calorias:  {'\t'}</Text>
                  <Text style={styles.bbiggerStext}>{selectedRecipe.calories} kcal</Text>
                </View> 

                <View style={{flexDirection: 'row'}}>
                 <Text style={styles.bbiggerStextT}>Carboidratos:  {'\t'}</Text>
                <Text style={styles.bbiggerStext}>{selectedRecipe.carbs} g</Text>
               </View> 
              </View>
    

               <View style={{flex: 1}}>
                 <View style={{flexDirection: 'row'}}>
                  <Text style={styles.bbiggerStextT}>Proteínas:  {'\t'}</Text>
                 <Text style={styles.bbiggerStext}>{selectedRecipe.protein} g</Text>
                 </View>     

                <View style={{flexDirection: 'row'}}>
                 <Text style={styles.bbiggerStextT}>Gorduras:  {'\t'}</Text>
                 <Text style={styles.bbiggerStext}>{selectedRecipe.fats} g</Text>
                  </View> 
               </View>
            </View>
          </View>
  </View>
      
        </Modal>
      )}
    </View>
  );
};

// Componente Custom para checkbox
const Custom = ({ label, isChecked, onCheck }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onCheck}>
    <View style={styles.outerCircle}>
      <View style={styles.innerCircle}>
        {isChecked && <View style={styles.filledCircle} />}
      </View>
    </View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

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
    marginLeft: 5,
  },
  subHeader: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ingredientsColumn: {
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft:10,
    paddingBottom:5,
  },
  nutritionalColumn: {
    paddingTop:5,
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft:10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginLeft: 150,
    marginTop: 6,
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#009900',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  innerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#009900',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeItem: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#ffdb99',
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
    backgroundColor: '#fff8dc',
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
    zIndex: 3,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
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
    alignSelf: 'flex-start',
  },
  biggerStext: {
    fontSize: 16,
    alignSelf: 'flex-start',
  },
  bbiggerStextT: {
    fontSize: 16,
    alignSelf:'flex-start',
    fontWeight: 'bold',
  },
  bbiggerStext: {
    fontSize: 16,
    alignSelf: 'flex-start',
  },
  Mtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingBottom:5,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 14,
  },
  noRecipesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noRecipesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default MealScreen;
