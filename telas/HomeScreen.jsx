import {useCallback, useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Image , } from 'react-native';
import { useNavigation , useFocusEffect} from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';
import cookimage from '../assets/images/home.jpg';


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
      <View style={styles.imageContainer}>
      <Image source={cookimage} style={styles.image}/>
      <Text style={styles.titleImage}>
          . Hello .{'\n'}Cookers
      </Text>
     
      </View>
      {/* Grade de botões */}
      <View style={styles.gridContainer}>
        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#ffd633',marginTop:40}]} 
          onPress={() => navigateToScreen('Meals')}
        >
          <Text style={styles.gridText}>Refeições</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#4dffc3', marginTop:40}]} 
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
          style={[styles.gridItem, {backgroundColor: '#ff99a8'}]} 
          onPress={() => navigateToScreen('SobremesasDrawer')}
        >
          <Text style={styles.gridText}>Sobremesas</Text>
        </TouchableOpacity>
        
       

        <TouchableOpacity 
          style={[styles.gridItem, {backgroundColor: '#d9d9d9'}]} 
          onPress={() => navigateToScreen('Settings')}
        >
          <Text style={styles.gridText}>Configurações</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.Title}> Utilizar a app</Text>
        <Text style={styles.Description}>
        {'\t'}✓ Explore uma ampla variedade de receitas, desde pratos principais até sobremesas aonde ao clickar nas mesmas conseguirá ver informações sobre as mesmas.{'\n\n'}
       {'\t'} ✓  Armazene os ingredientes que você tem em casa e descubra quais receitas pode preparar com eles.{'\n\n'}
       {'\t\t'}✓{'\t\t'}Mantenha uma lista de compras atualizada para não esquecer de nenhum ingrediente essencial.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 0,
  },
  titleImage: {
    position: 'absolute',  // Position the text over the image
    top: '50%',            // Center the text vertically
    left: '50%',           // Center the text horizontally
     // Adjust the text position to center it
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',        // Ensure the text is visible on the image
    textAlign: 'center',
    width: '100%',         // Ensure the text spans the width of the image
    padding: 10,   
    transform: [{ translateX: -178 }, { translateY: -50}],       
  },
  imageContainer: {
    position: 'relative',  // Make the container relative for positioning
    width: 350,            // Match the image width
    height: 250,           // Match the image height
    borderRadius: 20,
    overflow: 'hidden',    // Ensure content stays within the borders
    borderColor: 'black', // Border color (white in this example)
    borderWidth: 3, 
  },
  textContainer:{
    padding:10,
    backgroundColor:'#F0F0F0',
    borderRadius:20,
    margin:20,
    borderColor: 'black', // Border color (white in this example)
    borderWidth: 2, 
    
   
  },
  Title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop:10,
    textAlign: 'center',
  },
  Description: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20,
    marginRight:5,
    padding:5,
    
  },
  gridContainer: {
    flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',

  width: '100%',        // Make the container take up the full width
  marginBottom: 20,
  marginTop: 5,
  marginLeft: 0,        // Remove any left margin
  marginRight: 0,       // Remove any right margin
  paddingLeft: 0,       // Remove any left padding (if applicable)
  paddingRight: 0, 

  },
  image:{
    width: '100%',         // Ensure the image fits the container
    height: '100%',
    borderRadius: 10,
    
  },
  gridItem: {
    width: '40%', // Define a largura de cada botão para 40% da tela
    height: 100,  // Altura de cada botão
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10, // Espaço entre os botões
    borderRadius: 10,
    borderColor: 'black', // Border color (white in this example)
     borderWidth: 2, 
      // Shadow properties for iOS
  shadowColor: '#000',    // Shadow color (black)
  shadowOffset: { width: 0, height: 5 }, // Offset the shadow to create a depth effect
  shadowOpacity: 0.3,     // Shadow transparency (0.3 = 30% opaque)
  shadowRadius: 6.5,        // How blurry the shadow is
  
  // Elevation property for Android
  elevation: 10,           // Creates a shadow effect on Android
 
  },
  gridText: {
    fontSize: 18,
    color: 'black',
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

    borderColor: 'black', // Border color (white in this example)
    borderWidth: 2, 
     // Shadow properties for iOS
 shadowColor: '#000',    // Shadow color (black)
 shadowOffset: { width: 0, height: 5 }, // Offset the shadow to create a depth effect
 shadowOpacity: 0.3,     // Shadow transparency (0.3 = 30% opaque)
 shadowRadius: 6.5,        // How blurry the shadow is
   // Elevation property for Android
   elevation: 10,           // Creates a shadow effect on Android
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientTop: {
    height: '50%',
    backgroundColor: '#ff99a8',
  },
  gradientBottom: {
    height: '50%',
    backgroundColor: '#ffd633',
  },
  text: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1, // Garante que o texto fique sobre o gradiente
  },
});

export default HomeScreen;
