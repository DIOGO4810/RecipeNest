import  { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView,Pressable, Platform ,Alert} from 'react-native';
import { useFocusEffect,useNavigation } from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';
import { useSearch } from '../Contexts/SearchContext';
import { getDb } from '../baseDeDados/database';
import ingredientImages from '../imageMapping';
import { Feather,FontAwesome5,Ionicons } from '@expo/vector-icons';
import { removerAcentos } from '../baseDeDados/dataUtils';

const ShoppingList = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(null);
  const [unit, setUnit] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const db = getDb();
  const navigation = useNavigation();
  const { setfocus } = useFocus(); // Use o contexto de foco
  const {searchQuery} = useSearch();



  useFocusEffect(
    useCallback(() => {
      loadIngredients();
      setfocus('ShoppingList');

    }, [navigation,searchQuery])
  );

  const loadIngredients = () => {
    console.log('Carregando ingredientes...');
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM buylist',
        [],
        (_, { rows }) => {
          console.log('Ingredientes carregados:', rows._array);
          const ingredientsArray = rows._array.map(item => ({
            id: item.id.toString(),
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            
          }));
          const ingredientsArrayAfterSearch = ingredientsArray.filter
          ((item) => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );



          setIngredients(ingredientsArrayAfterSearch);
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
        'INSERT INTO buylist (name, quantity, unit) VALUES (?, ?, ?)',
        [removerAcentos(ingredientName.trim()), quantity, unit === null ? null : unit],
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
        'DELETE FROM buylist WHERE id = ?',
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
  
  const moveIngredientToAvailable = (item) => {
    const { id, name, quantity, unit } = item;
    console.log('Movendo ingrediente para a tabela de disponíveis:', item);
    
    
    db.transaction(tx => {
      // Step 1: Check if the ingredient already exists in the 'ingredients' table
      tx.executeSql(
        'SELECT * FROM ingredients WHERE name = ?',
        [name],
        (_, { rows }) => {

    

          if (rows.length > 0) {
            console.log('1');
            // Ingredient already exists, so update the quantity or unit
            const existingIngredient = rows.item(0);
            
            if( quantity === null && existingIngredient.quantity !== null || unit !== null && existingIngredient.quantity !== null ){
            Alert.alert('Erro de medida','Este ingrediente está a ser medido em quantidade no seu frigorífico');
            }else if (unit === null && existingIngredient.unit !== null || quantity !== null && existingIngredient.unit !== null ){
              Alert.alert('Erro de medida','Este ingrediente está a ser medido em unidades no seu frigorífico');
            }else{
            // Determine the new quantity and unit
            const newQuantity = quantity !== null ? (existingIngredient.quantity !== null ? Number(existingIngredient.quantity) + Number(quantity) : quantity) : existingIngredient.quantity ;
            const newUnit = unit !== null ? (existingIngredient.unit !== null ? Number(existingIngredient.unit) + Number(unit) : unit) : existingIngredient.unit;
  
            // Update the existing ingredient
            tx.executeSql(
              'UPDATE ingredients SET quantity = ?, unit = ? WHERE id = ?',
              [newQuantity, newUnit, existingIngredient.id],
              (_, updateResult) => {
                console.log('Ingrediente atualizado na tabela de disponíveis:', updateResult);
  
                // Delete the ingredient from the 'buylist' table
                tx.executeSql(
                  'DELETE FROM buylist WHERE id = ?',
                  [id],
                  (_, deleteResult) => {
                    console.log('Ingrediente removido da lista de compras:', deleteResult);
                    loadIngredients();
                  },
                  (tx, error) => {
                    console.error('Erro ao remover ingrediente da lista de compras:', error);
                  }
                );
              },
              (tx, error) => {
                console.error('Erro ao atualizar ingrediente na tabela de disponíveis:', error);
              }
            );
          } 
            }
            

          else {
            console.log('2');

            // Ingredient does not exist, insert it into the 'ingredients' table
            tx.executeSql(
              'INSERT INTO ingredients (name, quantity, unit, image) VALUES (?, ?, ?, ?)',
              [name, quantity, unit, name.toLowerCase().replace(/\s+/g, '-')],
              (_, insertResult) => {
                console.log('Ingrediente adicionado à tabela de disponíveis:', insertResult);
  
                // Delete the ingredient from the 'buylist' table
                tx.executeSql(
                  'DELETE FROM buylist WHERE id = ?',
                  [id],
                  (_, deleteResult) => {
                    console.log('Ingrediente removido da lista de compras:', deleteResult);
                    loadIngredients();
                  },
                  (tx, error) => {
                    console.error('Erro ao remover ingrediente da lista de compras:', error);
                  }
                );
              },
              (tx, error) => {
                console.error('Erro ao adicionar ingrediente à tabela de disponíveis:', error);
              }
            );
          }
        },
        (tx, error) => {
          console.error('Erro ao verificar se o ingrediente já existe na tabela de disponíveis:', error);
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
        `UPDATE buylist SET ${type} = ? WHERE id = ?`,
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
          <Text style={styles.biggerTextName}>{item.name}</Text>
          <TouchableOpacity onPress={() => moveIngredientToAvailable(item)} style={styles.checkbutton}>
          <FontAwesome5 name="check" size={24} color="#4dff4d" />
          </TouchableOpacity>
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
             <Text style={[styles.title]}>Lista de compras :</Text>
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
  biggerTextName: {
    fontSize: 20,
    marginLeft:20,
    marginTop:10
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#ffedcc',
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
    backgroundColor: '#ffc96f',
    padding: 10,
    shadowColor: '#000',    // Shadow color (black)
    shadowOffset: { width: 0, height: 5 }, // Offset the shadow to create a depth effect
    shadowOpacity: 0.3,     // Shadow transparency (0.3 = 30% opaque)
    shadowRadius: 6.5,        // How blurry the shadow is
    
    // Elevation property for Android
    elevation: 10,    
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  removeButton: {
    borderRadius: 5,
    marginTop:10,
    marginLeft:4    
},
checkbutton:{
    borderRadius: 5,
    marginLeft:20,
    marginTop:10,

  },
  button:{
    backgroundColor: '#ffdb99',
    borderRadius: 10,
  },
  text:{
    fontSize:18,
    padding:10,
    color: 'black',
  }
});

export default ShoppingList;
