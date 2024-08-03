import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../telas/HomeScreen';
import BakeryScreen from '../telas/BakeryScreen';
import ingredientScreen from '../telas/ingredientSreen';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Importar o pacote correto

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused,color, size }) => {
                    let iconName;

                    if (route.name === 'Refeições') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline'; 
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } else if (route.name === 'Sobremesas') {
                        iconName = focused ? 'cake-variant' : 'cake-variant-outline'; 
                        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                    } else if (route.name === 'Ingredientes') {
                        iconName = focused ? 'cart' : 'cart-outline'; 
                        return <Ionicons name={iconName} size={size} color={color} />;
                    }

                    // Return null or a default icon if route.name is not matched
                    return null;
                },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 16, // Aumenta o tamanho da fonte das labels
                    fontWeight: 'bold', // Torna as labels em negrito
                },
            })}
        >
            <Tab.Screen name="Refeições" component={HomeScreen} />
            <Tab.Screen name="Ingredientes" component={ingredientScreen} />
            <Tab.Screen name="Sobremesas" component={BakeryScreen} />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator;
