import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Pressable, Platform, Alert,Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';
import { useSearch } from '../Contexts/SearchContext';
import { getDb } from '../baseDeDados/database';
import ingredientImages from '../imageMapping';
import { Ionicons } from '@expo/vector-icons';
import { removerAcentos } from '../baseDeDados/dataUtils';


const {width,height} = Dimensions.get('window');
const fontsizeRelatable = width*0.04;


const AvailableIngredientsScreen = ({ navigation }) => {

  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const { setfocus } = useFocus();
  const [ingredients, setIngredients] = useState([]);
  const { searchQuery } = useSearch();
  const db = getDb();

  const {width,height} = Dimensions.get('window');
  const fontsizeRelatable = width*0.05;

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
      setfocus('IngredientesDrawer');
    }, [navigation, searchQuery])
  );

  const loadIngredients = () => {
    console.log('Carregando ingredientes...');
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ingredients',
        [],
        (_, { rows }) => {
          console.log('Ingredientes carregados:', rows._array);
          const ingredientsArray = rows._array.map(item => ({
            id: item.id.toString(),
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
          }));
  
          // Filtrando os ingredientes de acordo com a search query
          const ingredientsArrayAfterSearch = ingredientsArray.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
  
          // Remover ingredientes com quantity null e unit 0 ou vice versa
          ingredientsArrayAfterSearch.forEach(item => {
            if ((item.quantity === null && item.unit === '0.0') || 
                (item.unit === null && item.quantity === '0.0')) {
              console.log(`Removendo ingrediente com id ${item.id} porque quantidade é null e unidade é 0, ou vice-versa.`);
              removeIngredient(item.id);
            }
          });
  
          // Atualizar o estado com os ingredientes filtrados e verificados
          setIngredients(ingredientsArrayAfterSearch.filter(item => !((item.quantity === null && item.unit === 0) || (item.unit === null && item.quantity === 0))));
        },
        (tx, error) => {
          console.error('Erro ao carregar ingredientes:', error);
        }
      );
    });
  };
  

  const addIngredient = () => {
    if (!ingredientName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do ingrediente.');
      return;
    }
    if (quantity === '' && unit === '') {
      Alert.alert('Erro', 'Por favor, insira a quantidade ou a unidade.');
      return;
    }

    const imageName = ingredientName.toLowerCase().replace(/\s+/g, '-');
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO ingredients (name, quantity, unit, image) VALUES (?, ?, ?, ?)',
        [removerAcentos(ingredientName.trim()), quantity ? parseFloat(quantity) : null, unit ? parseFloat(unit) : null, imageName],
        () => {
          loadIngredients();
          setIngredientName('');
          setQuantity('');
          setUnit('');
        },
        (tx, error) => {
          console.error('Erro ao adicionar ingrediente:', error);
        }
      );
    });
  };

  const removeIngredient = (id) => {
    console.log('Removendo ingrediente com id:', id);
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM ingredients WHERE id = ?',
        [id],
        (_, result) => {
          console.log('Ingrediente removido com sucesso:', result);
          loadIngredients();
        },
        (tx, error) => {
          console.error('Erro ao remover ingrediente:', error);
        }
      );
    });
  };

  const handleTextInputChange = (id, value, type) => {
    const updatedIngredients = ingredients.map(ingredient =>
      ingredient.id === id
        ? { ...ingredient, [type]: value }
        : ingredient
    );
    setIngredients(updatedIngredients);
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE ingredients SET ${type} = ? WHERE id = ?`,
        [type === 'quantity' ? parseFloat(value) : parseFloat(value), id],
        (_, result) => {
          console.log('Ingrediente atualizado com sucesso:', result);
        },
        (tx, error) => {
          console.error('Erro ao atualizar ingrediente:', error);
        }
      );
    });
  };

  const renderItem = ({ item }) => {
    const imageSource = ingredientImages[item.image] || require('../assets/images/ingredients/default.png');

    console.log('Renderizando ingrediente:', item);

    return (
      <View style={[styles.ingredientItem, ingredients.length === 1 ? { width: '70%' } : { width: '48%' }]}>
        <View style={styles.detailsContainer}>
          <View style={{ flexDirection: 'row', alignSelf: 'center', marginBottom: 10 }}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeIngredient(item.id)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={24} color="#db8a8a" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder={item.quantity !== null ? "Altere a quantidade" : "Altere as unidades"}
            value={item.quantity !== null ? item.quantity.toString() : item.unit.toString()}
            onChangeText={(value) => handleTextInputChange(item.id, value, item.quantity !== null ? 'quantity' : 'unit')}
            keyboardType="numeric"
          />
          <Text style={[styles.biggerText, { alignSelf: 'center' }]}>
            {item.quantity !== null ? `${item.quantity} g/ml` : item.unit !== null ? `${item.unit} unidades` : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        key={'two-columns'}
        ListHeaderComponent={
          <View>
            <View style={{ alignItems: 'center', paddingVertical: 10, backgroundColor: '#FEFFFF', borderWidth: 2, borderColor: '#D0F4FF', borderRadius: 10, margin: 5 }}>
              <Text style={[styles.title, { maxWidth: 300, textAlign: 'center', marginBottom: 20 }]}>Adicionar Ingrediente </Text>
              <TextInput
                style={[styles.input, { width: 250 }]}  // Fixed width for the input
                placeholder="Nome do Ingrediente"
                value={ingredientName}
                onChangeText={setIngredientName}
              />
              <Text style={[styles.sliderLabel, { maxWidth: 250 }]}>
                Quantidade: {quantity !== '' ? quantity : 'NULL'} gramas/ml
              </Text>
              <TextInput
                style={[styles.input, { width: 250 }]}  // Fixed width for the input
                placeholder="Quantidade do Ingrediente"
                value={quantity}
                onChangeText={(value) => {
                  setQuantity(value);
                  if (value !== '') setUnit('');
                }}
                keyboardType="numeric"
                editable={unit === ''}
              />
              <Text style={[styles.sliderLabel, { maxWidth: 250 }]}>
                Unidades: {unit !== '' ? unit : 'NULL'}
              </Text>
              <TextInput
                style={[styles.input, { width: 250 }]}  // Fixed width for the input
                placeholder="Unidades do Ingrediente"
                value={unit}
                onChangeText={(value) => {
                  setUnit(value);
                  if (value !== '') setQuantity('');
                }}
                keyboardType="numeric"
                editable={quantity === ''}
              />
              <Pressable style={styles.button} onPress={addIngredient}>
                <Text style={styles.text}>{"Adicionar"}</Text>
              </Pressable>
            </View>
            <Text style={[styles.title2]}>O meu frigorífico </Text>
          </View>
        }
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={true}
        numColumns={2} // Sets two items per row
        columnWrapperStyle={ingredients.length === 1 ? { justifyContent: 'center' } : { justifyContent: 'space-between' }} // Ajuste condicional
        removeClippedSubviews={false}
      />
    </KeyboardAvoidingView>
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
    fontSize: 20,
    margin: 10,
    fontWeight: 'bold'
  },
  title2: {
    fontSize: 25,
    marginBottom: 10,
    marginTop: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  biggerText: {
    fontSize: 20,
  },
  input: {
    height: 40,
    borderColor: '#B0CDFE',
    borderWidth: 1,
    backgroundColor: '#E1F8FF',
    marginBottom: 20,
    padding: 10,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10
  },
  sliderLabel: {
    fontSize: fontsizeRelatable,
    margin: 10,
  },
  ingredientItem: {
    borderColor: '#B0CDFE',
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical:10,
    paddingHorizontal: 10,
    backgroundColor: '#D0F4FF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',    // Shadow color (black)
    shadowOffset: { width: 0, height: 5 }, // Offset the shadow to create a depth effect
    shadowOpacity: 0.3,     // Shadow transparency (0.3 = 30% opaque)
    shadowRadius: 6.5,        // How blurry the shadow is

    // Elevation property for Android
    elevation: 10,           // Creates a shadow effect on Android
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    marginLeft: 30,
  },
  button: {
    backgroundColor: '#BED6FE',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    padding: 10,
    color: 'black',
  }
});

export default AvailableIngredientsScreen;
