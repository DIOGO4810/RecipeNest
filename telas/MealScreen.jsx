import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal,Dimensions,ScrollView} from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect,useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons,FontAwesome5 } from '@expo/vector-icons';
import { useVegan } from '../Contexts/VeganContext';
import { useSearch } from '../Contexts/SearchContext';
import { useFocus } from '../Contexts/FocusContext';
import Toast from 'react-native-toast-message';



export function capitalizeFirstLetter(string) {
  if (!string) return ''; // Verifica se a string é vazia ou undefined

  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}    

// Dimensões da tela
    const { width, height } = Dimensions.get('window');
    const fontnormalModaWidth = width * 0.045;
    const fontnormalModalHeigth = height * 0.3;
    const fontTitleModal = width * 0.045;


const MealScreen = () => {
  // Estados
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTwoColumn, setIsTwoColumn] = useState(false);
  const [wasClicked,setWasClicked] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);
  const navigation = useNavigation(); // Hook para usar a navegação

  // Contextos
  const { isVeganChecked, setIsVeganChecked } = useVegan();
  const { focus,setfocus } = useFocus();
  const { searchQuery } = useSearch();

  console.log(width,height);

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
      setWasClicked(false);
    }, [isVeganChecked, searchQuery, navigation,wasClicked])
  );







  // Funções de pequenas
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

    // Função para navegação
    const navigateToScreen = (screen) => {
      setfocus(screen);
      console.log({focus});
      navigation.navigate(screen); // Navega para a tela especificada
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
// Função para renderizar a mensagem sem receitas disponíveis
const renderNoRecipes = () => (
  <View style={styles.noRecipesContainer}>
    <MaterialCommunityIcons name="emoticon-sad-outline" size={50} color="#555" />
    <Text style={styles.noRecipesText}>
      Nenhuma receita disponível. Para ver receitas, adicione ingredientes na página de ingredientes!
    </Text>

   <TouchableOpacity style={styles.button} onPress={() => navigateToScreen('IngredientesDrawer')}>
    <Text style={[styles.biggerLtext,{padding:10}]}>Navegar para os Ingredientes</Text>
   </TouchableOpacity>
  </View>
);



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



const fridgeCheck = async (ingredients) => {
  const db = getDb();

  const promises = ingredients.map((ingredient) => {
    const { name, quantity, unit } = ingredient;

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM ingredients WHERE name = ?',
          [capitalizeFirstLetter(name)],
          (_, { rows }) => {
            if (rows.length > 0) {
              const existingIngredient = rows.item(0);
               // Inicializa as variáveis fora dos blocos if-else
            let newQuantity = existingIngredient.quantity;
            let newUnit = existingIngredient.unit;

               // Atualiza as variáveis conforme a lógica de negócios
               if (existingIngredient.quantity !== null) {
                newQuantity = existingIngredient.quantity - quantity;
              }
              if (existingIngredient.unit !== null) {
                newUnit = existingIngredient.unit - unit;
              }
              console.log(newQuantity,newUnit);
              if ((newQuantity >= 0 || existingIngredient.quantity === null) &&
                  (newUnit >= 0 || existingIngredient.unit === null)) {
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          },
          (_, error) => {
            console.log('Erro ao verificar o ingrediente:', error);
            reject(error);
          }
        );
      });
    });
  });

  // Espera todas as promessas serem resolvidas e verifica se todos os ingredientes estão disponíveis
  const results = await Promise.all(promises);
  return results.every((isAvailable) => isAvailable);
};




const fridgeUpdate = (ingredients) => {
  const db = getDb();

  ingredients.forEach((ingredient) => {
    const { name, quantity, unit } = ingredient;

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ingredients WHERE name = ?',
        [capitalizeFirstLetter(name)],
        (_, { rows }) => {
          if (rows.length > 0) {
            const existingIngredient = rows.item(0);

            // Inicializa as variáveis fora dos blocos if-else
            let newQuantity = existingIngredient.quantity;
            let newUnit = existingIngredient.unit;

               // Atualiza as variáveis conforme a lógica de negócios
               if (existingIngredient.quantity !== null) {
                newQuantity = existingIngredient.quantity - quantity;
              }
              if (existingIngredient.unit !== null) {
                newUnit = existingIngredient.unit - unit;
              }
            tx.executeSql(
              'UPDATE ingredients SET quantity = ?, unit = ? WHERE name = ?',
              [newQuantity, newUnit, capitalizeFirstLetter(name)],
              (_, resultSet) => {
                console.log(`Ingrediente ${name} atualizado para ${newQuantity} e ${newUnit}.`);
                setWasClicked(true);
              },
              (_, error) => {
                console.log(`Erro ao atualizar ingrediente ${name}:`, error);
              }
            );
          }
        },
        (_, error) => {
          console.log('Erro ao verificar o ingrediente:', error);
        }
      );
    });
  });
};





const handleCheckAndUpdate = async () => {
  const allIngredientsAvailable = await fridgeCheck(selectedRecipe.ingredients);
  if (allIngredientsAvailable) {
    fridgeUpdate(selectedRecipe.ingredients);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Receita finalizada',
      text2: 'Retiramos os ingredientes do firgorifico.',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 70,
      textStyle:'bold',
      swipeEnabled: true,
      text1Style: {
        color: 'black', // Cor do texto principal
        fontSize: 16, // Tamanho da fonte do texto principal
      },
      text2Style: {
        color: 'black', // Cor do texto secundário
        fontSize: 14, // Tamanho da fonte do texto secundário
      },

    });
    setSelectedRecipe(false); // Feche a receita selecionada
  } 
};






// Return da funçao principal

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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.checkbutton} onPress={handleCheckAndUpdate}>
          <FontAwesome5 name="check" size={24} color="#4dff4d" />
        </TouchableOpacity>

        <Text style={styles.checkButtonText}>Acabado</Text>
        {/* <Image source={selectedRecipe.image} style={styles.modalRecipeImage} /> */}
        <Text style={styles.modalRecipeName}>{selectedRecipe.name}</Text>
        <Text style={styles.Mtitle}>Tempo de Preparação: {selectedRecipe.preparation_time} minutos</Text>
        <Text style={[styles.modalRecipeDesc, { marginBottom: 10 }]}>{selectedRecipe.description}</Text>

        <View style={styles.ingredientsColumn}>
          <Text style={styles.Mtitle}>Ingredientes:</Text>
          {selectedRecipe.ingredients.map((ingredient, index) => (
            <View key={index} style={{ flexDirection: 'row' }}>
              <Text style={styles.bbiggerStextT}>
                {'> '} {ingredient.name}{'\t'}
              </Text>
              <Text style={styles.bbiggerStext}>
                - {`${ingredient.quantity} gramas ou ${ingredient.unit} unidades`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.nutritionalColumn}>
          <Text style={styles.Mtitle}>Valores Nutricionais:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.bbiggerStextT}>Calorias: {'\t'}</Text>
                <Text style={styles.bbiggerStext}>{selectedRecipe.calories} kcal</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.bbiggerStextT}>Carboidratos: {'\t'}</Text>
                <Text style={styles.bbiggerStext}>{selectedRecipe.carbs} g</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.bbiggerStextT}>Proteínas: {'\t'}</Text>
                <Text style={styles.bbiggerStext}>{selectedRecipe.protein} g</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.bbiggerStextT}>Gorduras: {'\t'}</Text>
                <Text style={styles.bbiggerStext}>{selectedRecipe.fats} g</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginLeft: 'auto',
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
    width: 12,
    height: 12,
    borderRadius: 6,
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
    flex: 1, // Garante que o container do modal ocupe todo o espaço disponível
    justifyContent: 'flex-end', // Garante que o modal fique na parte inferior
  },
  scrollViewContent:{
    flexGrow: 1, // Garante que o ScrollView ocupe todo o espaço disponível

  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 3,
  },
  checkbutton:{
    position: 'absolute',
    top: 40,
    right: 5,
    padding: 10,
    zIndex: 3,
    borderRadius: 5,
    marginLeft:20,
    marginTop:10,

  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4dff4d',
    textAlign: 'center',
    marginTop: 45, // Ajusta a margem superior conforme necessário
    position: 'absolute',
    top: 40,
    right: 5,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop:10,
    marginVertical: 10,
    alignSelf:'flex-start'
  },
  modalRecipeDesc:{
    fontSize: fontnormalModaWidth,
    alignSelf: 'flex-start',
 

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
    fontSize: fontTitleModal,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingBottom:5,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 14,
  },
  button: {
    backgroundColor: '#D0F4FF',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
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
