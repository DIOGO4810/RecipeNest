import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { getDb } from '../baseDeDados/database';
import ingredientImages from '../imageMapping';

const AvailableIngredientsScreen = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(null);
  const [unit, setUnit] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const db = getDb();

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
    }, [])
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
    } else {
      console.log('Nome do ingrediente está vazio.');
    }
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
      <View style={styles.ingredientItem}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <TextInput
            style={styles.input}
            placeholder={item.quantity !== null ? "Altere a quantidade" : "Altere as unidades"}
            value={item.quantity !== null ? item.quantity.toString() : item.unit.toString()}
            onChangeText={(value) => handleTextInputChange(item.id, value, item.quantity !== null ? 'quantity' : 'unit')}
            keyboardType="numeric"
          />
          <Text style={styles.biggerText}>
            {item.quantity !== null ? `${item.quantity} g/ml` : item.unit !== null ? `${item.unit} unidades` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => removeIngredient(item.id)} style={styles.removeButton}>
          <Icon name="trash-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };



  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
      <TextInput
        style={styles.input}
        placeholder="Quantidade do Ingrediente"
        value={quantity !== null ? quantity.toString() : ''}
        onChangeText={(value) => {
          setQuantity(value === '' ? null : parseInt(value));
          if (value !== '') setUnit(null);
        }}
        keyboardType="numeric"
        editable={unit === null}
      />
      <Text style={styles.sliderLabel}>
        Unidades: {unit !== null ? unit : 'NULL'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Unidades do Ingrediente"
        value={unit !== null ? unit.toString() : ''}
        onChangeText={(value) => {
          setUnit(value === '' ? null : parseInt(value));
          if (value !== '') setQuantity(null);
        }}
        keyboardType="numeric"
        editable={quantity === null}
      />
      <Button title="Adicionar" onPress={addIngredient} />
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={true}
        removeClippedSubviews={false} // Faz com que o teclado n feche ao chegar ao final da tela 
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
  },
  biggerText: {
    fontSize: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
    width: '80%',
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
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 10,
    borderRadius: 5,
  },
});

export default AvailableIngredientsScreen;
