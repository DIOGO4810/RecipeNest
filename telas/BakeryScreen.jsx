import  { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { checkIngredientsAvailability } from '../baseDeDados/dataUtils';
import { getDb } from '../baseDeDados/database';
import { useFocusEffect } from '@react-navigation/native';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocus } from '../Contexts/FocusContext';
import { useVegan } from '../Contexts/VeganContext';
import { useSearch } from '../Contexts/SearchContext';

const BakeryScreen = ({navigation}) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTwoColumn, setIsTwoColumn] = useState(false); // Estado para controlar o número de colunas
  const [recypeCount,setRecypeCount] = useState(0);
  const {setfocus}=useFocus();
  const { searchQuery } = useSearch();
  const {isVeganChecked,setIsVeganChecked} = useVegan();

  const fetchRecipes = async () => {
    try {
      const db = getDb();

      db.transaction((tx) => {
        let query = 'SELECT * FROM recipes WHERE category = ?';
        let params = ['sobremesa'];

        if (isVeganChecked) {
          query += ' AND isVegan = ?';
          params.push(1); // 1 representa receitas vegetarianas
        }

        tx.executeSql(
          query,
          params,
          async (_, { rows }) => {
            const recipes = rows._array.map((recipe) => {
              const ingredients = JSON.parse(
                recipe.ingredients.replace(/\\"/g, '"').replace(/^"|"$/g, '')
              );
              return {
                ...recipe,
                ingredients,
              };
            });

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
            setRecypeCount(filteredRecipesWithoutSearch.length);
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
      setfocus('SobremesasDrawer');
    }, [navigation,isVeganChecked,searchQuery])
  );

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleVeganCheck = () => {
    setIsVeganChecked((prevState) => !prevState);
  };

  const Custom = ({ label, isChecked, onCheck }) => {
    return (
      <TouchableOpacity style={styles.checkboxContainer} onPress={onCheck}>
        {/* Círculo externo */}
        <View style={styles.outerCircle}>
          {/* Círculo interno */}
          <View style={styles.innerCircle}>
            {/* Círculo preenchido (aparece apenas se estiver selecionado) */}
            {isChecked && <View style={styles.filledCircle} />}
          </View>
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    );
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
      <View>
        <View style={styles.subHeader}>
          <Text style={[styles.title, { marginBottom: 5 }]}> Sobremesas </Text>
          <Custom label="Vegan" isChecked={isVeganChecked} onCheck={handleVeganCheck} />
        </View>
  
        <View style={styles.headerRow}>
          <Text style={[styles.subTitle, { marginTop: 5 }]}>Disponiveis: {recypeCount}</Text>
  
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

            <Text style={{fontSize:16,fontWeight: 'bold',}}>Tempo de Preparação: {selectedRecipe.preparation_time} minutos {'\n'}</Text>
      <Text style={[styles.biggerLtext,{marginBottom:10}]}>{selectedRecipe.description}</Text>

      {/* Alinhar Ingredientes e Valores Nutricionais em paralelo */}
     
        <View style={styles.ingredientsContainer}>
          <Text style={styles.Mtitle}>Ingredientes:</Text>
          {selectedRecipe.ingredients.map((ingredient, index) => (
            <View   key={index} style={{flexDirection:'row'}}>
              <Text   style={{fontSize:16,fontWeight: 'bold',}} >
              {'>'} {ingredient.name} {'\t'}
               </Text>
               <Text style={styles.bbiggerStext} >
               - {` ${ingredient.quantity} gramas ou ${ingredient.unit} unidades` }
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
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
  bbiggerStext: {
    fontSize: 16,
    alignSelf:'flex-start',
  },
  bbiggerStextT: {
    fontSize: 16,
    alignSelf:'flex-start',
    fontWeight: 'bold',
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginLeft: 105,
    marginTop: 6,
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12, // Metade da largura/altura para um círculo perfeito
    borderWidth: 2,
    borderColor: '#009900', // Cor do anel externo
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,

  },
  innerCircle: {
    width: 18, // Menor que o círculo externo
    height: 18, // Menor que o círculo externo
    borderRadius: 9, // Metade da largura/altura para um círculo perfeito
    backgroundColor: 'white', // Cor do fundo interno
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledCircle: {
    width: 10, // Menor que o círculo interno
    height: 10, // Menor que o círculo interno
    borderRadius: 5, // Metade da largura/altura para um círculo perfeito
    backgroundColor: '#009900', // Cor do círculo preenchido
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientsContainer: {
   
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
  Stitle: {
    fontSize: 14,
    fontWeight: 'bold',
    margin: 20,
  },
  Mtitle: {
    paddingBottom:5,
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    
  },
  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeItem: {
    margin: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    width: 300,
    backgroundColor: '#ffccd4', // Cor de fundo da receita
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recipeImage: {
    borderRadius: 20,
    marginBottom: 10,
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
    backgroundColor: '#ffe6e9', // Cor de fundo do model da receita que normalmente um bocado mais claro que o da receita em si
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
    fontSize:16,
   },

   biggerMtext:{
    fontSize:18,
    alignSelf: 'flex-start',  // Alinha o texto à esquerda
    marginTop: 10,
   },
   biggerStext:{
    fontSize:16,
    alignSelf:'flex-start'
   },
   subTitle: {
    fontSize: 18,
    fontWeight:'500',
    marginLeft:14
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

export default BakeryScreen;
