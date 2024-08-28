import  { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView,Pressable, Platform ,Alert} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocus } from '../Contexts/FocusContext';
import { getDb } from '../baseDeDados/database';
import ingredientImages from '../imageMapping';

const AvailableIngredientsScreen = ({navigation}) => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(null);
  const [unit, setUnit] = useState(null);
  const {setfocus}= useFocus();
  const [ingredients, setIngredients] = useState([]);
  const db = getDb();

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
      setfocus('IngredientesDrawer');
    }, [navigation])
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
          setIngredients(ingredientsArray);
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
    if (quantity === null && unit === null) {
      Alert.alert('Erro', 'Por favor, insira a quantidade ou a unidade.');
      return;
    }

    const imageName = ingredientName.toLowerCase().replace(/\s+/g, '-');
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO ingredients (name, quantity, unit, image) VALUES (?, ?, ?, ?)',
        [ingredientName, quantity, unit === null ? null : unit, imageName],
        () => {
          loadIngredients();
          setIngredientName('');
          setQuantity(null);
          setUnit(null);
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
        [value, id],
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
          <View style={{flexDirection:'row', alignSelf:'center',marginBottom:10}}>
          <Text style={styles.title}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeIngredient(item.id)} style={styles.removeButton}>
          <Icon name="trash-outline" size={24} color="#db8a8a" />
          </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder={item.quantity !== null ? "Altere a quantidade" : "Altere as unidades"}
            value={item.quantity !== null ? item.quantity.toString() : item.unit.toString()}
            onChangeText={(value) => handleTextInputChange(item.id, value, item.quantity !== null ? 'quantity' : 'unit')}
            keyboardType="numeric"
          />
         
          <Text style={[styles.biggerText,{alignSelf:'center'}]}>
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
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={[styles.title, { maxWidth: 300, textAlign: 'center' }]}>Adicionar Ingrediente</Text>
            <TextInput
              style={[styles.input, { width: 250 }]}  // Fixed width for the input
              placeholder="Nome do Ingrediente"
              value={ingredientName}
              onChangeText={setIngredientName}
            />
            <Text style={[styles.sliderLabel, { maxWidth: 250 }]}>
              Quantidade: {quantity !== null ? quantity : 'NULL'} gramas/ml
            </Text>
            <TextInput
              style={[styles.input, { width: 250 }]}  // Fixed width for the input
              placeholder="Quantidade do Ingrediente"
              value={quantity !== null ? quantity.toString() : ''}
              onChangeText={(value) => {
                setQuantity(value === '' ? null : parseInt(value));
                if (value !== '') setUnit(null);
              }}
              keyboardType="numeric"
              editable={unit === null}
            />
            <Text style={[styles.sliderLabel, { maxWidth: 250 }]}>
              Unidades: {unit !== null ? unit : 'NULL'}
            </Text>
            <TextInput
              style={[styles.input, { width: 250 }]}  // Fixed width for the input
              placeholder="Unidades do Ingrediente"
              value={unit !== null ? unit.toString() : ''}
              onChangeText={(value) => {
                setUnit(value === '' ? null : parseInt(value));
                if (value !== '') setQuantity(null);
              }}
              keyboardType="numeric"
              editable={quantity === null}
            />
             <Pressable style={styles.button} onPress={addIngredient}>
             <Text style={styles.text}>{"Adicionar"}</Text>
             </Pressable>
             <View style={{width:'100%',height:2,backgroundColor:'rgba(0,0,0,0.4)',marginVertical:20}}></View>
             <Text style={[styles.title]}>O meu frigorífico</Text>
          </View >
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
    fontWeight:'bold'
  },
  biggerText: {
    fontSize: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#e6fff7',
    marginBottom:20,
    padding: 10,
    width: '80%',
    alignSelf:'center',
    borderRadius:10
  },
  sliderLabel: {
    fontSize: 16,
    margin: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#ccffee',
    padding: 10,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 10,
    marginBottom:5,
    borderRadius: 5,
    marginLeft:30,
  },
  button:{
    backgroundColor: '#99ffdd',
    borderRadius: 10,
  },
  text:{
    fontSize:18,
    padding:10,
    color: 'black',
  }
});

export default AvailableIngredientsScreen;
