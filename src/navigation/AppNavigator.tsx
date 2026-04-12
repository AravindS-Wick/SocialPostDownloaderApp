import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import DownloadScreen from '../screens/DownloadScreen';
import HistoryScreen from '../screens/HistoryScreen';
import BatchScreen from '../screens/BatchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen';
import VerificationScreen from '../screens/VerificationScreen';
import AdminRightsScreen from '../screens/AdminRightsScreen';
import BugReportScreen from '../screens/BugReportScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

export type RootStackParamList = {
  Main: undefined;
  Download: { url?: string; platform?: string };
  History: undefined;
  Settings: undefined;
  Auth: undefined;
  Verification: undefined;
  AdminRights: undefined;
  BugReport: undefined;
  ChangePassword: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; resetToken?: string };
};

export type MainTabParamList = {
  Home: { redownloadUrl?: string; redownloadPlatform?: string; redownloadType?: string } | undefined;
  Batch: undefined;
  History: undefined;
  Settings: undefined;
  BugReport?: undefined;
  AdminRights?: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Batch') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'BugReport') {
            iconName = focused ? 'bug' : 'bug-outline';
          } else if (route.name === 'AdminRights') {
            iconName = focused ? 'shield' : 'shield-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Batch" component={BatchScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      {(role === 'admin' || role === 'tester') && (
        <Tab.Screen
          name="BugReport"
          component={BugReportScreen}
          options={{ tabBarLabel: 'Bug Report' }}
        />
      )}
      {role === 'admin' && (
        <Tab.Screen
          name="AdminRights"
          component={AdminRightsScreen}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Main"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Download" component={DownloadScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="AdminRights" component={AdminRightsScreen} options={{ headerShown: true, title: 'Admin Rights' }} />
      <Stack.Screen name="BugReport" component={BugReportScreen} options={{ headerShown: true, title: 'Bug Report' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
