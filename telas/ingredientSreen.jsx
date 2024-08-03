import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider'; // Atualize a importação

import { getDb } from '../baseDeDados/database'; // Certifique-se de que este caminho está correto
import ingredientImages from '../imageMapping'; // Certifique-se de que este caminho está correto

const AvailableIngredientsScreen = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(null); // Quantidade padrão null
  const [unit, setUnit] = useState(null); // Unidade padrão null
  const [unitValue, setUnitValue] = useState(0); // Valor numérico para o Slider
  const [ingredients, setIngredients] = useState([]);
  const db = getDb();

  useEffect(() => {
    loadIngredients();
  }, []);

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
    if (ingredientName.trim()) {
      const imageName = ingredientName.toLowerCase().replace(/\s+/g, '-');
      console.log('Adicionando ingrediente:', {
        name: ingredientName,
        quantity,
        unit,
        image: imageName
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO ingredients (name, quantity, unit, image) VALUES (?, ?, ?, ?)',
          [ingredientName, quantity, unit === 'Null' ? null : unit, imageName],
          (_, result) => {
            console.log('Ingrediente adicionado com sucesso:', result);
            loadIngredients(); // Recarregar ingredientes após adição
            setIngredientName('');
            setQuantity(null); // Reset para null
            setUnit(null); // Reset para null
            setUnitValue(0); // Reset para 0
          },
          (tx, error) => {
            console.error('Erro ao adicionar ingrediente:', error);
          }
        );
      });
    } else {
      console.log('Nome do ingrediente está vazio.');
    }
  };

  const handleUnitChange = value => {
    setUnitValue(value);
    setUnit(value === 0 ? null : value.toString());
  };

  const renderItem = ({ item }) => {
    const imageSource = ingredientImages[item.image] || require('../assets/images/ingredients/default.png');

    console.log('Renderizando ingrediente:', item);

    return (
      <View style={styles.ingredientItem}>
      <View style={styles.ingredientDetails}>
        <Text style={styles.title}>{item.name}</Text>
      </View>
      <View style={styles.ingredientQuantity}>
        <Text style={styles.biggerText}>
          {item.quantity !== null ? `${item.quantity} g` : `${item.unit} unidades`}
        </Text>
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
      <Text style={styles.sliderLabel}>
        Quantidade: {quantity !== null ? quantity : 'NULL'} gramas
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1000}
        step={1}
        value={quantity !== null ? quantity : 0}
        onValueChange={value => setQuantity(value === 0 ? null : value)}
      />
      <Text style={styles.sliderLabel}>
        Unidades: {unit !== null ? unit : 'NULL'}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={20}
        step={1}
        value={unitValue}
        onValueChange={handleUnitChange}
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
  title: {
    fontSize: 20,
    margin: 10,
  },
  biggerText: {
    fontSize:20
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
    justifyContent: 'space-between',
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
  ingredientQuantity: {
    flexShrink: 0,
  
  },
});

export default AvailableIngredientsScreen;
