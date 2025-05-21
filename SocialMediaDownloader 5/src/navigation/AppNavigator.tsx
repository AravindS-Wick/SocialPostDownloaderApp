import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DownloadScreen from '../screens/DownloadScreen';
import AboutScreen from '../screens/AboutScreen';
import PlatformConnectScreen from '../screens/PlatformConnectScreen';

// Define the parameter types for our stack navigator
export type RootStackParamList = {
  Main: undefined;
  Download: { url?: string; platform?: string };
  About: undefined;
  PlatformConnect: undefined;
};

// Define the parameter types for our tab navigator
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
function MainTabNavigator() {
  const theme = useSelector((state: RootState) => 
    state.settings.isDarkMode ? 'dark' : 'light'
  );
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme === 'dark' ? '#5b89c7' : '#4a6da7',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Root stack navigator
export default function AppNavigator() {
  const theme = useSelector((state: RootState) => 
    state.settings.isDarkMode ? 'dark' : 'light'
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        headerTintColor: theme === 'dark' ? '#f0f0f0' : '#333333',
        cardStyle: { backgroundColor: theme === 'dark' ? '#121212' : '#f7f7f7' }
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Download" 
        component={DownloadScreen} 
        options={{ title: 'Download Media' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
      <Stack.Screen 
        name="PlatformConnect" 
        component={PlatformConnectScreen} 
        options={{ title: 'Connect Platforms' }}
      />
    </Stack.Navigator>
  );
}