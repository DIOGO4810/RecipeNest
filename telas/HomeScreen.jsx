import {useCallback, useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Image , } from 'react-native';
import { useNavigation , useFocusEffect} from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';
import cookimage from '../assets/images/2149028622.jpg';

const HomeScreen = () => {
  const navigation = useNavigation(); // Hook para usar a navegação
  const { focus, setfocus } = useFocus(); // Use o contexto de foco
  useFocusEffect(
    useCallback(() => {
      setfocus('Home');
    }, [navigation])
  );

  // Função para navegação
  const navigateToScreen = (screen) => {
    setfocus(screen);
    console.log({focus});
    navigation.navigate(screen); // Navega para a tela especificada
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.Title}>
        Hello Cookers
      </Text>
      <Image source={cookimage} style={styles.image}/>
     
      {/* Grade de botões */}
      <View style={styles.gridContainer}>
        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#ffd633'}]} 
          onPress={() => navigateToScreen('Meals')}
        >
          <Text style={styles.gridText}>Refeições</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#ff99a8'}]} 
          onPress={() => navigateToScreen('SobremesasDrawer')}
        >
          <Text style={styles.gridText}>Sobremesas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#4dffc3'}]} 
          onPress={() => navigateToScreen('IngredientesDrawer')}
        >
          <Text style={styles.gridText}>Ingredientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToScreen('Todas_Receitas')}
        >
          <View style={styles.gradientContainer}>
            <View style={styles.gradientBottom} />
            <View style={styles.gradientTop} />
          </View>
          <Text style={styles.text}>Todas Receitas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#ffb833'}]} 
          onPress={() => navigateToScreen('Lista_de_compras')}
        >
          <Text style={styles.gridText}>Lista de Compras</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#d9d9d9'}]} 
          onPress={() => navigateToScreen('Settings')}
        >
          <Text style={styles.gridText}>Configurações</Text>
        </TouchableOpacity>
      </View>
        <Text style={styles.Title}> Explicação brévia da app</Text>
      <Text style={styles.Description}>
        Explore uma ampla variedade de receitas, desde pratos principais até sobremesas.{'\n\n'}
        Armazene os ingredientes que você tem em casa e descubra quais receitas pode preparar com eles.{'\n\n'}
        Mantenha uma lista de compras atualizada para não esquecer de nenhum ingrediente essencial.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  Title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  Description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image:{
    width:350,
    height:250,
    borderRadius:10
  },
  gridItem: {
    width: '40%', // Define a largura de cada botão para 40% da tela
    height: 100,  // Altura de cada botão
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10, // Espaço entre os botões
    borderRadius: 10,
  },
  gridText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    width: '40%', // Define a largura do botão
    height: 100,  // Altura do botão
    margin: 10,   // Espaço entre os botões
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientTop: {
    height: '50%',
    backgroundColor: '#ffd633',
  },
  gradientBottom: {
    height: '50%',
    backgroundColor: '#ffccd4',
  },
  text: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1, // Garante que o texto fique sobre o gradiente
  },
});

export default HomeScreen;
