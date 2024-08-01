import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider'; // Atualize a importação

import { getDb } from '../baseDeDados/database'; // Certifique-se de que este caminho está correto
import ingredientImages from '../imageMapping'; // Certifique-se de que este caminho está correto

const AvailableIngredientsScreen = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(1); 
  const [unit, setUnit] = useState(1); 
  const [ingredients, setIngredients] = useState([]);
  const db = getDb();

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ingredients',
        [],
        (_, { rows }) => {
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
          console.error(error);
        }
      );
    });
  };

  const addIngredient = () => {
    if (ingredientName.trim()) {
      const imageName = ingredientName.toLowerCase().replace(/\s+/g, '-');
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO ingredients (name, quantity, unit, image) VALUES (?, ?, ?, ?)',
          [ingredientName, quantity, unit, imageName],
          (_, result) => {
            const newIngredient = {
              id: result.insertId.toString(),
              name: ingredientName,
              quantity,
              unit,
              image: imageName,
            };
            setIngredients([...ingredients, newIngredient]);
            setIngredientName('');
            setQuantity(1); // Reset para o valor inicial
            setUnit(1);
          },
          (tx, error) => {
            console.error(error);
          }
        );
      });
    }
  };

  const renderItem = ({ item }) => {
    const imageSource = ingredientImages[item.image] || require('../assets/images/ingredients/default.png');

    return (
      <View style={styles.cont}>
        <Image source={imageSource} style={styles.ingredientImage} />
        <View>
          <Text>{item.name}               </Text>
        </View>
        <View>
          <Text>{item.quantity} {item.unit}</Text>
        </View>

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Ingrediente</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Ingrediente"
        value={ingredientName}
        onChangeText={setIngredientName}
      />
      <Text style={styles.sliderLabel}>Quantidade: {quantity} gramas</Text>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={1000}
        step={1}
        value={quantity}
        onValueChange={value => setQuantity(value)}
      />
        <Text style={styles.sliderLabel}>Unidades: {unit} </Text>      
        <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={unit}
        onValueChange={value => setUnit(value)}
      />
      <Button title="Adicionar" onPress={addIngredient} />
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cont:{
    padding:20,
    flexDirection:'row'
  },
  title: {
    fontSize: 20,
    margin: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
    width: '80%',
  },
  slider: {
    width: '80%',
    margin: 10,
  },
  sliderLabel: {
    fontSize: 16,
    margin: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  ingredientImage: {
    width: 55,
    height: 55,
    marginRight: 10,
  },
  ingredientDetails: {
    flex: 1,
  },
});

export default AvailableIngredientsScreen;
