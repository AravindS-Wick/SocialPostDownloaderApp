import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
import TermsGateScreen from '../screens/TermsGateScreen';
import LegalScreen from '../screens/LegalScreen';

// Bump this string whenever legal docs change materially.
// Any stored termsVersion that doesn't match will re-show the gate.
export const CURRENT_TERMS_VERSION = '1.0';

export type RootStackParamList = {
  Main: undefined;
  Download: { url?: string; platform?: string };
  History: undefined;
  Settings: undefined;
  Auth: { initialMode?: 'login' | 'register' } | undefined;
  Verification: undefined;
  AdminRights: undefined;
  BugReport: undefined;
  ChangePassword: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; resetToken?: string };
  TermsGate: undefined;
  Legal: { docKey: 'privacy' | 'terms' | 'conditions' | 'usage' };
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

const GRADIENT_COLORS: [string, string] = ['#6C47FF', '#9575FF'];
const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Batch: 'Batch',
  History: 'History',
  Settings: 'Settings',
  BugReport: 'Bugs',
  AdminRights: 'Admin',
};

const TAB_ICONS: Record<string, [string, string]> = {
  Home: ['home', 'home-outline'],
  Batch: ['layers', 'layers-outline'],
  History: ['time', 'time-outline'],
  Settings: ['settings', 'settings-outline'],
  BugReport: ['bug', 'bug-outline'],
  AdminRights: ['shield', 'shield-outline'],
};

function CustomTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const isDark = theme.dark;

  const tabBg = isDark ? '#120D22' : '#FFFFFF';
  const borderTop = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(108,71,255,0.1)';

  return (
    <View style={[styles.tabBar, { backgroundColor: tabBg, borderTopColor: borderTop }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const label = TAB_LABELS[route.name] || route.name;
        const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            {isFocused ? (
              <LinearGradient
                colors={GRADIENT_COLORS}
                style={styles.tabActiveBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name={activeIcon as any} size={20} color="white" />
                <Text style={styles.tabActiveLabelGradient}>{label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabInactiveBtn}>
                <Ionicons
                  name={inactiveIcon as any}
                  size={22}
                  color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(108,71,255,0.4)'}
                />
                <Text
                  style={[
                    styles.tabInactiveLabel,
                    { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(108,71,255,0.5)' },
                  ]}
                >
                  {label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      id={undefined}
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
  // Gate check: must have accepted the current version of the terms.
  const { termsAccepted, termsVersion } = useSelector(
    (state: RootState) => state.settings,
  );
  const needsTermsAcceptance =
    !termsAccepted || termsVersion !== CURRENT_TERMS_VERSION;

  return (
    <Stack.Navigator
      id={undefined}
      // If terms not accepted, open the gate first — it resets to Main on accept.
      initialRouteName={needsTermsAcceptance ? 'TermsGate' : 'Main'}
      screenOptions={{ headerShown: false }}
    >
      {/* ── Terms gate — shown before anything else ── */}
      <Stack.Screen
        name="TermsGate"
        component={TermsGateScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      {/* ── Main app ── */}
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Download" component={DownloadScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="AdminRights" component={AdminRightsScreen} options={{ headerShown: true, title: 'Admin Rights' }} />
      <Stack.Screen name="BugReport" component={BugReportScreen} options={{ headerShown: true, title: 'Bug Report' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false, presentation: 'modal' }} />

      {/* ── Full legal document viewer (accessible from Settings & TermsGate) ── */}
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabActiveBackground: {
    flex: 1,
    borderRadius: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabActiveLabelGradient: {
    color: 'white',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  tabInactiveBtn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInactiveLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
