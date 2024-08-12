import React from 'react';
import { Text } from 'react-native';
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
                tabBarIcon: ({ focused, size }) => {
                    let iconName;
                    let iconColor = 'gray'; // Default color

                    if (route.name === 'Refeições') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline';
                        iconColor = focused ? '#ffe680' : 'gray'; // Specific color dos icons for Refeições
                        return <Ionicons name={iconName} size={size} color={iconColor} />;
                    } else if (route.name === 'Sobremesas') {
                        iconName = focused ? 'cake-variant' : 'cake-variant-outline';
                        iconColor = focused ? '#ffb6c1' : 'gray'; // Specific color for Sobremesas
                        return <MaterialCommunityIcons name={iconName} size={size} color={iconColor} />;
                    } else if (route.name === 'Ingredientes') {
                        iconName = focused ? 'cart' : 'cart-outline';
                        iconColor = focused ? '#33ffbb' : 'gray'; // Specific color for Ingredientes
                        return <Ionicons name={iconName} size={size} color={iconColor} />;
                    }

                    // Return null or a default icon if route.name is not matched
                    return null;
                },
                tabBarLabel: ({ focused }) => {
                    let labelColor = 'gray'; // Default color

                    if (route.name === 'Refeições') {
                        labelColor = focused ? '#ffd633' : 'gray'; // Specific color do titulo for Refeições
                    } else if (route.name === 'Sobremesas') {
                        labelColor = focused ? '#ff99a8' : 'gray'; // Specific color for Sobremesas
                    } else if (route.name === 'Ingredientes') {
                        labelColor = focused ? '#00ffaa' : 'gray'; // Specific color for Ingredientes
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
            <Tab.Screen name="Refeições" component={HomeScreen} />
            <Tab.Screen name="Ingredientes" component={ingredientScreen} />
            <Tab.Screen name="Sobremesas" component={BakeryScreen} />
        </Tab.Navigator>
    );
}
export default BottomTabNavigator;
