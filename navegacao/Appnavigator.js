import React from 'react';
import { Text,TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../telas/HomeScreen';
import BakeryScreen from '../telas/BakeryScreen';
import ingredientScreen from '../telas/ingredientSreen';
import SettingsScreen from '../telas/SettingsScreen';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen 
                name="Refeições" 
                component={HomeScreen} 
                options={({ navigation }) => ({
                    headerRight: () => (
                        <TouchableOpacity 
                        onPress={() => navigation.navigate('Settings')}
                        style={{ marginRight: 15,}}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // Adiciona área clicável extra 
                        >
                         <Ionicons name="settings-outline" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    // Opcionalmente, você pode ajustar outras propriedades do cabeçalho padrão
                })}
            />
            <HomeStack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: 'Configurações' }} 
            />
        </HomeStack.Navigator>
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
            <Tab.Screen name="Refeições" component={HomeStackNavigator} options={{headerShown:false}}/>
            <Tab.Screen name="Ingredientes" component={ingredientScreen} />
            <Tab.Screen name="Sobremesas" component={BakeryScreen} />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator;
