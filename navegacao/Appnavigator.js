import  { useState, useCallback, useRef } from 'react';
import { Text, TouchableOpacity, View, TextInput, Keyboard ,Switch} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import HomeScreen from '../telas/HomeScreen';
import BakeryScreen from '../telas/BakeryScreen';
import ingredientScreen from '../telas/ingredientSreen';
import SettingsScreen from '../telas/SettingsScreen';
import EveryRecipe from '../telas/EveryRecipe';
import ShoppingList from '../telas/ShoppingList';
import { useVegan } from '../Contexts/VeganContext';
import { useSearch } from '../Contexts/SearchContext';
import { Feather,Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function CustomDrawerContent(props) {
  const { isVeganChecked, setIsVeganChecked } = useVegan();

  const handleVeganToggleSwitch = () => {
    setIsVeganChecked(prevState => !prevState);
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Drawer Items */}
      <DrawerItemList {...props} />
      
      {/* Vegan Toggle Switch */}
      <View style={{ marginLeft: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#6c6c6c' }}>Receitas Vegetarianas</Text>
        <Switch
          value={isVeganChecked}
          onValueChange={handleVeganToggleSwitch}
          style={{ marginLeft: 10 }}
          thumbColor={isVeganChecked ? '#59b300' : '#e6ffcc'}
          trackColor={{ false: '#d9ffb3', true: '#408000' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  const inputRef = useRef(null);
  const navigation = useNavigation();

  const handleSearchIconPress = () => {
    setIsSearchBarExpanded(true);
    setTimeout(() => {
      
        console.log("Attempting to focus the TextInput...");
        inputRef.current.focus();
        console.log("TextInput focused:", inputRef.current.isFocused());
      
    }, 100); // Atraso para garantir que o componente esteja renderizado
  };
  
  

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchBarExpanded(false);
    console.log("TextInput focused:", inputRef.current.isFocused());
  };

  useFocusEffect(
    useCallback(() => {
      const onBlur = () => {
        if (isSearchBarExpanded ) {
          setSearchQuery('');
          setIsSearchBarExpanded(false);
        }
      };

      const unsubscribe = navigation.addListener('state', onBlur);
      console.log({isSearchBarExpanded});
      console.log({inputRef});

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
            {isSearchBarExpanded ? (
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
            )}
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
        name="HomeStack"
        component={HomeScreen}
        options={{ drawerLabel: 'Início' }}
        
      />
      <Drawer.Screen
        name="Todas_Receitas"
        component={EveryRecipe}
        options={{ drawerLabel: 'Todas as Receitas',headerTitle:'Todas as Receitas' }}
      />
      <Drawer.Screen
        name="Lista_de_compras"
        component={ShoppingList}
        options={{ drawerLabel: 'Lista de compras' ,headerTitle:'Lista de compras'}}
        
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerLabel: 'Configurações',headerTitle:'Settings' }}
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
      <Tab.Screen name="Refeições" component={DrawerNavigator} options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeStack'); // Always navigate to "Início" screen of DrawerNavigator
          },
        })} />
      <Tab.Screen name="Ingredientes" component={ingredientScreen} />
      <Tab.Screen name="Sobremesas" component={BakeryScreen} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
