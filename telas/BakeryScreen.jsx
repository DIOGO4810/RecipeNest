import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { getDb } from '../baseDeDados/database'; // Certifique-se de que o caminho está correto

const BakeryScreen = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = () => {
      const db = getDb();

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM recipes WHERE category = ?',
          ['sobremesa'],
          (_, { rows }) => {
            setRecipes(rows._array);
            console.log('Receitas recuperadas:', rows._array); // Adicione isto para verificar
          },
          (tx, error) => {
            console.error('Erro ao buscar receitas', error);
          }
        );
      });
    };

    fetchRecipes();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.recipeItem}>
      <Image source={item.image} style={styles.recipeImage} />
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>Tempo de Preparação: {item.preparation_time} minutos</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      <FlatList
        data={recipes}
        keyExtractor={item => item.id.toString()}
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
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  recipeItem: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '90%',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default BakeryScreen;
