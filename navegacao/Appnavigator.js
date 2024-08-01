import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../telas/HomeScreen';
import BakeryScreen from '../telas/BakeryScreen';
import ingredientScreen from '../telas/ingredientSreen'
import { Ionicons,  MaterialCommunityIcons,Feather,MaterialIcons,FontAwesome } from '@expo/vector-icons'; // Importar o pacote correto

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Comida') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline'; 
                        return <Ionicons name={iconName} size={size} color="black" />;
                    } else if (route.name === 'Sobremesas') {
                        iconName = focused ? 'cake-variant' : 'cake-variant-outline'; 
                        return <MaterialCommunityIcons name={iconName} size={size} color="black" />;
                    } else if (route.name === 'Ingredientes') {
                      iconName = focused ? 'cart' : 'cart-outline'; 
                      return <Ionicons name={iconName} size={size} color="black" />;
                    }

                    // Return null or a default icon if route.name is not matched
                    return null;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Comida" component={HomeScreen} />
            <Tab.Screen name="Ingredientes" component={ingredientScreen} />
            <Tab.Screen name="Sobremesas" component={BakeryScreen} />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator;
