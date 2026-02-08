// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

// Screens

import BookingScreen from './src/screens/BookingScreen';
import HomeScreen from './src/screens/HomeScreen';
import NewSaleScreen from './src/screens/NewSaleScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Define route names + params (all undefined for now)
export type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  NewSale: undefined;
  Bookings: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'ClothingStorePOS' }}
        />
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
          options={{ title: 'Products & Stock' }}
        />
        <Stack.Screen
          name="NewSale"
          component={NewSaleScreen}
          options={{ title: 'New Sale' }}
        />
        <Stack.Screen
          name="Bookings"
          component={BookingScreen}
          options={{ title: 'Tattoo Bookings' }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Reports' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
