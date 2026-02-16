import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { clearHistory } from '../store/slices/historySlice';
import {
  toggleNotifications,
  setQualityPreference,
  toggleSaveToGallery,
  toggleDarkMode,
  setDownloadPath
} from '../store/slices/settingsSlice';
import type { QualityPreference } from '../store/slices/settingsSlice';
import { List, Divider, Button, Card, useTheme, RadioButton } from 'react-native-paper';
import { clearActivityLogs } from '../services/logger';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ResponsiveContainer from '../components/ResponsiveContainer';

const PRESET_PATHS = ['SocialSaver', 'Downloads', 'MediaFiles'];

const DownloadPathPicker = ({ currentPath, onPathChange, theme }: {
  currentPath: string;
  onPathChange: (path: string) => void;
  theme: any;
}) => {
  const isCustom = !PRESET_PATHS.includes(currentPath);
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  return (
    <View style={styles.qualityOptions}>
      <RadioButton.Group
        onValueChange={(value) => {
          if (value === '__custom__') {
            setShowCustomInput(true);
            if (!isCustom) onPathChange('');
          } else {
            setShowCustomInput(false);
            onPathChange(value);
          }
        }}
        value={showCustomInput ? '__custom__' : currentPath}
      >
        {PRESET_PATHS.map((p) => (
          <RadioButton.Item key={p} label={p} value={p} style={styles.radioItem} />
        ))}
        <RadioButton.Item label="Custom..." value="__custom__" style={styles.radioItem} />
      </RadioButton.Group>
      {showCustomInput && (
        <RNTextInput
          style={[styles.customPathInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
          value={currentPath}
          onChangeText={onPathChange}
          placeholder="Enter folder name"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}
    </View>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { downloads } = useSelector((state: RootState) => state.history);
  const settings = useSelector((state: RootState) => state.settings);
  
  // Handle clearing download history
  const handleClearHistory = () => {
    Alert.alert(
      'Clear Download History',
      'Are you sure you want to clear your download history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            dispatch(clearHistory());
            Alert.alert('Success', 'Download history has been cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle clearing activity logs
  const handleClearLogs = () => {
    Alert.alert(
      'Clear Activity Logs',
      'Are you sure you want to clear your activity logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await clearActivityLogs();
              Alert.alert('Success', 'Activity logs have been cleared');
            } catch (error) {
              console.error('Failed to clear activity logs:', error);
              Alert.alert('Error', 'Failed to clear activity logs. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle logging out
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ResponsiveContainer>
      {/* User Profile */}
      {isAuthenticated && user && (
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileAvatar}>
              {user.profileImage ? (
                <FontAwesome5 name="user-circle" size={60} color="#3498db" />
              ) : (
                <FontAwesome5 name="user-circle" size={60} color="#3498db" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>{user.username}</Text>
              <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>{user.email}</Text>
            </View>
          </Card.Content>
        </Card>
      )}
      
      {/* App Settings */}
      <List.Section>
        <List.Subheader>App Settings</List.Subheader>
        
        <List.Item
          title="Notifications"
          description="Receive notifications when downloads complete"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={() => dispatch(toggleNotifications())}
            />
          )}
        />

        <Divider />

        <List.Item
          title="Download Quality"
          description={`Current: ${settings.qualityPreference === 'best' ? 'Best Available' : settings.qualityPreference === 'manual' ? 'Ask Each Time' : settings.qualityPreference}`}
          left={props => <List.Icon {...props} icon="high-quality" />}
        />
        <View style={styles.qualityOptions}>
          <RadioButton.Group
            onValueChange={(value) => dispatch(setQualityPreference(value as QualityPreference))}
            value={settings.qualityPreference ?? 'best'}
          >
            {[
              { value: 'best', label: 'Best Available' },
              { value: '1080p', label: '1080p HD' },
              { value: '720p', label: '720p HD' },
              { value: '480p', label: '480p' },
              { value: '360p', label: '360p' },
              { value: 'manual', label: 'Ask Each Time' },
            ].map((opt) => (
              <RadioButton.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </View>

        <Divider />

        <List.Item
          title="Save to Gallery"
          description="Automatically save downloads to your device's gallery"
          left={props => <List.Icon {...props} icon="image" />}
          right={() => (
            <Switch
              value={settings.saveToGallery}
              onValueChange={() => dispatch(toggleSaveToGallery())}
            />
          )}
        />

        <Divider />

        <List.Item
          title="Dark Mode"
          description="Switch between light and dark themes"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={settings.darkMode}
              onValueChange={() => dispatch(toggleDarkMode())}
            />
          )}
        />
        <Divider />

        <List.Item
          title="Download Folder"
          description={`Saves to: ${settings.downloadPath}/Videos, Audio, Images`}
          left={props => <List.Icon {...props} icon="folder" />}
        />
        <DownloadPathPicker
          currentPath={settings.downloadPath}
          onPathChange={(p) => dispatch(setDownloadPath(p))}
          theme={theme}
        />
      </List.Section>

      {/* Data Management */}
      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        
        <List.Item
          title="Download History"
          description={`${downloads.length} downloads saved`}
          left={props => <List.Icon {...props} icon="history" />}
          right={props => (
            <Button 
              mode="text" 
              onPress={handleClearHistory}
              disabled={downloads.length === 0}
            >
              Clear
            </Button>
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Activity Logs"
          description="Clear your activity data"
          left={props => <List.Icon {...props} icon="clipboard-list" />}
          right={props => (
            <Button 
              mode="text" 
              onPress={handleClearLogs}
            >
              Clear
            </Button>
          )}
        />
      </List.Section>
      
      {/* About & Help */}
      <List.Section>
        <List.Subheader>About & Help</List.Subheader>
        
        <List.Item
          title="About This App"
          description="Version 1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        
        <Divider />
        
        <List.Item
          title="Privacy Policy"
          description="View our privacy policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
        />
        
        <Divider />
        
        <List.Item
          title="Terms of Service"
          description="View our terms of service"
          left={props => <List.Icon {...props} icon="file-document" />}
        />
        
        <Divider />
        
        <List.Item
          title="Help & Support"
          description="Get help using the app"
          left={props => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>
      
      {/* Account Actions */}
      <View style={styles.accountActions}>
        {isAuthenticated ? (
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            icon="logout-variant"
          >
            Log Out
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Auth')}
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            icon="login-variant"
          >
            Log In / Sign Up
          </Button>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>Social Media Downloader © 2025</Text>
      </View>
      </ResponsiveContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  accountActions: {
    padding: 16,
    alignItems: 'center',
  },
  logoutButton: {
    width: '80%',
    marginTop: 10,
    borderWidth: 1,
  },
  loginButton: {
    width: '80%',
    marginTop: 10,
  },
  qualityOptions: {
    paddingHorizontal: 8,
  },
  radioItem: {
    paddingVertical: 2,
  },
  customPathInput: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default SettingsScreen;