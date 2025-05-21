import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Button, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RootState } from '../store';
import {
  toggleDarkMode,
  toggleAllowAgeRestricted,
  toggleAutoDownload,
  toggleNotifications,
  setSaveLocation
} from '../store/slices/settingsSlice';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  const {
    isDarkMode,
    allowAgeRestricted,
    autoDownload,
    notificationsEnabled,
    saveLocation
  } = useSelector((state: RootState) => state.settings);
  
  const { isLoggedIn, connectedPlatforms } = useSelector((state: RootState) => state.auth);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Settings
        </Text>
      </View>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
          Appearance
        </List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Switch between light and dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={() => dispatch(toggleDarkMode())}
            />
          )}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
          Download Options
        </List.Subheader>
        <List.Item
          title="Allow Age-Restricted Content"
          description="Download content with age restrictions"
          left={props => <List.Icon {...props} icon="security" />}
          right={() => (
            <Switch
              value={allowAgeRestricted}
              onValueChange={() => dispatch(toggleAllowAgeRestricted())}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Auto-Download"
          description="Automatically start download when URL is detected"
          left={props => <List.Icon {...props} icon="download-circle-outline" />}
          right={() => (
            <Switch
              value={autoDownload}
              onValueChange={() => dispatch(toggleAutoDownload())}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Notifications"
          description="Receive notifications about downloads"
          left={props => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={() => dispatch(toggleNotifications())}
            />
          )}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
          Account & Social Platforms
        </List.Subheader>
        <List.Item
          title="Connect Social Platforms"
          description={connectedPlatforms.length > 0 
            ? `Connected: ${connectedPlatforms.join(', ')}` 
            : "Connect to social media platforms"
          }
          left={props => <List.Icon {...props} icon="link-variant" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('PlatformConnect')}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
          About
        </List.Subheader>
        <List.Item
          title="About This App"
          description="Learn more about Social Media Downloader"
          left={props => <List.Icon {...props} icon="information-outline" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('About')}
        />
        <Divider />
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="cellphone-arrow-down" />}
        />
      </List.Section>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Social Media Downloader © 2024
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
  },
});

export default SettingsScreen;