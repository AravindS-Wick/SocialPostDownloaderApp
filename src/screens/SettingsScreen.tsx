import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { clearHistory } from '../store/slices/historySlice';
import { 
  toggleNotifications, 
  toggleDownloadQualityAuto, 
  toggleSaveToGallery, 
  toggleDarkMode 
} from '../store/slices/settingsSlice';
import { List, Divider, Button, Card, IconButton } from 'react-native-paper';
import { clearActivityLogs } from '../services/logger';
import { FontAwesome5 } from '@expo/vector-icons';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { downloads } = useSelector((state: RootState) => state.history);
  const settings = useSelector((state: RootState) => state.settings);
  
  // Use Redux state values for initial values
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [downloadQualityAuto, setDownloadQualityAuto] = useState(settings.downloadQualityAuto);
  const [saveToGallery, setSaveToGallery] = useState(settings.saveToGallery);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  
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
  const handleClearLogs = async () => {
    Alert.alert(
      'Clear Activity Logs',
      'Are you sure you want to clear your activity logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            await clearActivityLogs();
            Alert.alert('Success', 'Activity logs have been cleared');
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
    <ScrollView style={styles.container}>
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
              <Text style={styles.profileName}>{user.username}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
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
          right={props => (
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                dispatch(toggleNotifications());
              }}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Automatic Quality Selection"
          description="Choose best quality based on your connection"
          left={props => <List.Icon {...props} icon="auto-fix" />}
          right={props => (
            <Switch
              value={downloadQualityAuto}
              onValueChange={setDownloadQualityAuto}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Save to Gallery"
          description="Automatically save downloads to your device's gallery"
          left={props => <List.Icon {...props} icon="image" />}
          right={props => (
            <Switch
              value={saveToGallery}
              onValueChange={setSaveToGallery}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Dark Mode"
          description="Switch between light and dark themes"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          )}
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
      {isAuthenticated && (
        <View style={styles.accountActions}>
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout-variant"
          >
            Log Out
          </Button>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Social Media Downloader © 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
    color: '#666',
    marginTop: 4,
  },
  accountActions: {
    padding: 16,
    alignItems: 'center',
  },
  logoutButton: {
    width: '80%',
    marginTop: 10,
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});

export default SettingsScreen;