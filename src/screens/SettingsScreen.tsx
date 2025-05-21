import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, List, Divider, Button, Surface, useTheme, RadioButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { checkPermissions, requestPermissions } from '../services/permissions';
import { setupFolders } from '../services/storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Settings state
  const [autoDetectPlatform, setAutoDetectPlatform] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultDownloadType, setDefaultDownloadType] = useState('video');
  const [defaultResolution, setDefaultResolution] = useState('720p');
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);
  
  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
    checkMediaPermissions();
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [autoDetectPlatform, notificationsEnabled, defaultDownloadType, defaultResolution]);

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setAutoDetectPlatform(parsedSettings.autoDetectPlatform ?? true);
        setNotificationsEnabled(parsedSettings.notificationsEnabled ?? true);
        setDefaultDownloadType(parsedSettings.defaultDownloadType ?? 'video');
        setDefaultResolution(parsedSettings.defaultResolution ?? '720p');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = async () => {
    try {
      const settings = {
        autoDetectPlatform,
        notificationsEnabled,
        defaultDownloadType,
        defaultResolution,
      };
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Check media library permissions
  const checkMediaPermissions = async () => {
    const hasPermissions = await checkPermissions();
    setHasMediaPermissions(hasPermissions);
  };

  // Request media library permissions
  const requestMediaPermissions = async () => {
    const granted = await requestPermissions();
    setHasMediaPermissions(granted);
    
    if (granted) {
      // If permissions are granted, setup folders
      await setupFolders();
      Alert.alert('Success', 'Media library permissions granted. SocialSaver folders are ready.');
    }
  };

  // Open app settings
  const openAppSettings = async () => {
    await Linking.openSettings();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Permissions Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Permissions
        </Text>
        
        <View style={styles.permissionRow}>
          <View style={styles.permissionInfo}>
            <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
              Media Library Access
            </Text>
            <Text style={[styles.permissionDesc, { color: theme.colors.text }]}>
              Required to save downloaded files
            </Text>
          </View>
          <View style={styles.permissionStatus}>
            {hasMediaPermissions ? (
              <Feather name="check-circle" size={24} color="green" />
            ) : (
              <Button 
                mode="outlined" 
                onPress={requestMediaPermissions}
                compact
              >
                Grant
              </Button>
            )}
          </View>
        </View>
        
        {!hasMediaPermissions && (
          <Text style={[styles.permissionWarning, { color: theme.colors.error }]}>
            Media library permission is required for downloads to work properly.
          </Text>
        )}
        
        <Button 
          mode="text" 
          onPress={openAppSettings}
          style={styles.settingsButton}
          compact
        >
          Open Device Settings
        </Button>
      </Surface>
      
      {/* Download Settings */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Download Settings
        </Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Auto-detect platform from URL
          </Text>
          <Switch
            value={autoDetectPlatform}
            onValueChange={setAutoDetectPlatform}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={[styles.settingGroupLabel, { color: theme.colors.text }]}>
          Default Download Type
        </Text>
        <RadioButton.Group
          onValueChange={value => setDefaultDownloadType(value)}
          value={defaultDownloadType}
        >
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="Video"
              value="video"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="Audio Only"
              value="audio"
              color={theme.colors.primary}
            />
          </View>
        </RadioButton.Group>
        
        <Divider style={styles.divider} />
        
        <Text style={[styles.settingGroupLabel, { color: theme.colors.text }]}>
          Default Video Quality
        </Text>
        <RadioButton.Group
          onValueChange={value => setDefaultResolution(value)}
          value={defaultResolution}
        >
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="1080p"
              value="1080p"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="720p"
              value="720p"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="480p"
              value="480p"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.radioRow}>
            <RadioButton.Item
              label="360p"
              value="360p"
              color={theme.colors.primary}
            />
          </View>
        </RadioButton.Group>
      </Surface>
      
      {/* Notification Settings */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Notifications
        </Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Show download notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </Surface>
      
      {/* About */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          About
        </Text>
        
        <List.Item
          title="Application Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="info" />}
        />
        
        <List.Item
          title="Terms of Service"
          onPress={() => Linking.openURL('https://example.com/terms')}
          left={props => <List.Icon {...props} icon="file-text" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Privacy Policy"
          onPress={() => Linking.openURL('https://example.com/privacy')}
          left={props => <List.Icon {...props} icon="shield" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionDesc: {
    fontSize: 14,
  },
  permissionStatus: {
    marginLeft: 12,
  },
  permissionWarning: {
    fontSize: 14,
    marginBottom: 12,
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 12,
  },
  settingGroupLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioRow: {
    marginVertical: 0,
  },
});

export default SettingsScreen;
