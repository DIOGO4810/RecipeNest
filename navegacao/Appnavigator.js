import React from 'react';
import { Text,TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../telas/HomeScreen';
import BakeryScreen from '../telas/BakeryScreen';
import ingredientScreen from '../telas/ingredientSreen';
import SettingsScreen from '../telas/SettingsScreen';
import EveryRecipe from '../telas/EveryRecipe';

import { Ionicons, MaterialCommunityIcons,Feather } from '@expo/vector-icons';


const Drawer = createDrawerNavigator();
const HomeStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="HomeTela" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
        </HomeStack.Navigator>
    );
}

function DrawerNavigator() {
    return (
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({

        drawerStyle: {
                width: 220,
                    }, 
              
              
          headerStyle: {
            backgroundColor: '#fff',
          },


          headerTitleAlign: 'left', // Alinha o título à esquerda

          headerTitle: () => (
            <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: '500' }}>
              Home
            </Text>
          ),


          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()} // Abre o menu lateral
              style={{ marginRight: 15 }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // Adiciona área clicável extra 

            >
            <Feather name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),

          headerLeft: () => null, // Remove o botão padrão do lado esquerdo

          drawerPosition:"right" // Define a posição do drawer para a direita

        })}
      >
        <Drawer.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{ drawerLabel: 'Início' }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ drawerLabel: 'Configurações' }}
        />
        <Drawer.Screen
          name="Todas_Receiats"
          component={EveryRecipe}
          options={{ drawerLabel: 'Todas as Receitas' }}
        />
      </Drawer.Navigator>
    );
  }

function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, size }) => {
                    let iconName;
                    let iconColor = 'gray';

                    if (route.name === 'Refeições') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline';
                        iconColor = focused ? '#ffe680' : 'gray';
                        return <Ionicons name={iconName} size={size} color={iconColor} />;
                    } else if (route.name === 'Sobremesas') {
                        iconName = focused ? 'cake-variant' : 'cake-variant-outline';
                        iconColor = focused ? '#ffb6c1' : 'gray';
                        return <MaterialCommunityIcons name={iconName} size={size} color={iconColor} />;
                    } else if (route.name === 'Ingredientes') {
                        iconName = focused ? 'cart' : 'cart-outline';
                        iconColor = focused ? '#33ffbb' : 'gray';
                        return <Ionicons name={iconName} size={size} color={iconColor} />;
                    }

                    return null;
                },
                tabBarLabel: ({ focused }) => {
                    let labelColor = 'gray';

                    if (route.name === 'Refeições') {
                        labelColor = focused ? '#ffd633' : 'gray';
                    } else if (route.name === 'Sobremesas') {
                        labelColor = focused ? '#ff99a8' : 'gray';
                    } else if (route.name === 'Ingredientes') {
                        labelColor = focused ? '#00ffaa' : 'gray';
                    }

                    return (
                        <Text style={{ color: labelColor, fontSize: 16, fontWeight: 'bold' }}>
                            {route.name}
                        </Text>
                    );
                },
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Refeições" component={DrawerNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Ingredientes" component={ingredientScreen} />
            <Tab.Screen name="Sobremesas" component={BakeryScreen} />
        </Tab.Navigator>
    );
}
export default BottomTabNavigator;
