import { useState, useCallback, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput , Dimensions} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList,DrawerItem } from '@react-navigation/drawer';
import MealScreen from '../telas/MealScreen';
import BakeryScreen from '../telas/BakeryScreen';
import IngredientScreen from '../telas/ingredientSreen';
import SettingsScreen from '../telas/SettingsScreen';
import EveryRecipe from '../telas/EveryRecipe';
import ShoppingList from '../telas/ShoppingList';
import HomeScreen from '../telas/HomeScreen';
import HelpScreen from '../telas/HelpSreen';
import { useSearch } from '../Contexts/SearchContext';
import { useFocus } from '../Contexts/FocusContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Custom Drawer Content
function CustomDrawerContent(props) {
  // Verifica se a rota atual está focada
  const isHelpFocused = props.state.routeNames[props.state.index] === 'Help';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
      {/* Drawer items go here */}
      <View>
        <DrawerItemList {...props} />
      </View>

      {/* Custom item at the bottom using DrawerItem */}
      <DrawerItem
        label="Help"
        icon={() => <Feather name="help-circle" size={20} color='black' />}
        onPress={() => props.navigation.navigate('Help')}
        focused={isHelpFocused} // Esta linha adiciona o foco ao item Help quando está selecionado
        style={{ marginBottom: 10 }}
      />
    </DrawerContentScrollView>
  );
}

// Drawer Navigator
function DrawerNavigator() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  const {focus} = useFocus();

  const inputRef = useRef(null);
  const navigation = useNavigation();

  const handleSearchIconPress = () => {
    setIsSearchBarExpanded(true);
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchBarExpanded(false);
  };

  useFocusEffect(
    useCallback(() => {
      const onBlur = () => {
        if (isSearchBarExpanded) {
          setSearchQuery('');
          setIsSearchBarExpanded(false);
        }
      };

      const unsubscribe = navigation.addListener('state', onBlur);

      return unsubscribe;
    }, [isSearchBarExpanded, navigation, setSearchQuery])
  );

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerStyle: {
          width: 220,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleAlign: 'left',
        headerTitle: () => (
          <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: '500' }}>
            Home
          </Text>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            {(focus === 'Meals' || focus === 'IngredientesDrawer' || focus === 'SobremesasDrawer' || focus === 'EveryRecipe'|| focus === 'ShoppingList' ) ? 
            (
              isSearchBarExpanded ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    ref={inputRef}
                    style={{
                      height: 35,
                      width: 180,
                      borderColor: 'gray',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      backgroundColor: '#f4f4f4',
                    }}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity onPress={handleClearSearch} style={{ marginLeft: -30, marginRight: 10 }}>
                    <Feather name="x-circle" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleSearchIconPress}
                    style={{ marginRight: 15 }}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Feather name="search" size={24} color="black" />
                  </TouchableOpacity>
                )
            ) : null
            }

            



            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 10 }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Feather name="menu" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ),
        headerLeft: () => null,
        drawerPosition: 'right',
      })}
    >
      <Drawer.Screen
        name="HomeDrawer"
        component={HomeScreen}
        options={{
          drawerLabel: 'Início',
          
        }}
      />
      <Drawer.Screen
      name="Meals"
      component={MealScreen}
      options={{
      drawerLabel: 'Refeições',
       headerTitle: 'Refeições',
       }}
/>

      <Drawer.Screen
        name="SobremesasDrawer"
        component={BakeryScreen}
        options={{
          drawerLabel: 'Sobremesas',
          headerTitle: 'Sobremesas',
          
        }}
      />
      <Drawer.Screen
        name="IngredientesDrawer"
        component={IngredientScreen}
        options={{
          drawerLabel: 'Ingredientes',
          headerTitle: 'Ingredientes',
          
        }}
      />
      <Drawer.Screen
        name="Todas_Receitas"
        component={EveryRecipe}
        options={{
          drawerLabel: 'Todas as Receitas',
          headerTitle: 'Todas as Receitas',
          
        }}
      />
      <Drawer.Screen
        name="Lista_de_compras"
        component={ShoppingList}
        options={{
          drawerLabel: 'Lista de compras',
          headerTitle: 'Lista de compras',
         
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Configurações',
          headerTitle: 'Settings',
        
        }}
      />
        <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerLabel: 'Help',
          headerTitle: 'Help',
          drawerItemStyle: { height: 0 }, // Hide it from the default list
        }}
      />
    </Drawer.Navigator>
  );
}

// Bottom Tab Navigator
function BottomTabNavigator() {
  const {focus,setfocus} = useFocus();
  const navigation = useNavigation(); // useNavigation hook to navigate to drawer screens

  // Get screen width
const { width, height } = Dimensions.get('window');

// Calculate dynamic size based on screen size
const dynamicIconSize = width * 0.07; // 7% of the screen width
const dynamicFontSize = width * 0.034; // 4% of the screen width

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          const isFocused = focus == route.name; // Verifique se a aba está focada
         // console.log({isFocused});
         // console.log({focus});
         // console.log(`Rendering icon for route: ${route.name}`); // Log route.name

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
            color = 'gray'
            return <Ionicons name={iconName} size={dynamicIconSize} color={color} />;
          } else if (route.name === 'Refeições') {
            iconName = focus == 'Meals' ? 'fast-food' : 'fast-food-outline';
            color = focus == 'Meals' ? '#ffe680' : 'gray';
            return <Ionicons name={iconName} size={dynamicIconSize} color={color} />;
          } else if (route.name === 'Sobremesas') {
            iconName = focus == 'SobremesasDrawer' ? 'cake-variant' : 'cake-variant-outline';
            color = focus == 'SobremesasDrawer' ? '#ffb6c1' : 'gray';
            return <MaterialCommunityIcons name={iconName} size={dynamicIconSize} color={color} />;
          } else if (route.name === 'Ingredientes') {
            iconName = focus == 'IngredientesDrawer' ? 'cart' : 'cart-outline';
            color = focus == 'IngredientesDrawer' ? '#BBEEFE' : 'gray';
            return <Ionicons name={iconName} size={dynamicIconSize} color={color} />;
          }

          return null;
        },
        tabBarLabel: ({ focused }) => {
          let labelColor = focused ? 'black' : 'gray';

          if (route.name === 'Home') {
            labelColor = 'black';
          } else if (route.name === 'Refeições') {
            labelColor = focus == 'Meals' ? '#ffd633' : 'gray';
          } else if (route.name === 'Sobremesas') {
            labelColor = focus == 'SobremesasDrawer' ? '#ff99a8' : 'gray';
          } else if (route.name === 'Ingredientes') {
            labelColor = focus == 'IngredientesDrawer' ? '#85E2FF' : 'gray';
          }

          return (
            <Text style={{ color: labelColor, fontSize: dynamicFontSize, fontWeight: 'bold' }}>
              {route.name}
            </Text>
          );
        },
        tabBarActiveTintColor: '#00ffaa', // Define a cor ativa de forma global
        tabBarInactiveTintColor: 'gray',   // Define a cor inativa de forma global
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DrawerNavigator} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setfocus('Home');
            navigation.navigate('HomeDrawer'); // Navega para a tela 'Home' do Drawer
          },
        })}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Refeições" 
        component={DrawerNavigator} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setfocus('Meals');
            navigation.navigate('Meals'); // Navega para a tela 'Meals' do Drawer
          },
        })}
        options={{ headerShown: false }}
      />

      <Tab.Screen 
        name="Sobremesas" 
        component={DrawerNavigator} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setfocus('SobremesasDrawer');
            navigation.navigate('SobremesasDrawer'); // Navega para a tela 'Sobremesas' do Drawer
          },
        })}
        options={{ headerShown: false }}
      />

      <Tab.Screen 
        name="Ingredientes" 
        component={DrawerNavigator} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setfocus('IngredientesDrawer');
            navigation.navigate('IngredientesDrawer'); // Navega para a tela 'Ingredientes' do Drawer
          },
        })}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
