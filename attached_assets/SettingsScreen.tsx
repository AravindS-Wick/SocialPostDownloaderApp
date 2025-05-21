import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, useTheme, Divider, Button, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../store';
import { 
  toggleDarkMode, 
  toggleAllowAgeRestricted, 
  toggleAutoDownload, 
  toggleNotifications,
  setDefaultDownloadType,
  setDefaultQuality,
  setDownloadDirectory
} from '../store/slices/settingsSlice';

const SettingsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const {
    isDarkMode,
    allowAgeRestricted,
    autoDownload,
    notifications,
    defaultDownloadType,
    defaultQuality,
    downloadDirectory,
    showSuggestions
  } = settings;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Enable dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={() => dispatch(toggleDarkMode())}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Content</List.Subheader>
        <List.Item
          title="Allow Age-Restricted Content"
          description="Enable downloading age-restricted videos (requires authentication)"
          left={props => <List.Icon {...props} icon="lock" />}
          right={() => (
            <Switch
              value={allowAgeRestricted}
              onValueChange={() => dispatch(toggleAllowAgeRestricted())}
              color={theme.colors.primary}
              disabled={!isAuthenticated}
            />
          )}
        />
        <List.Item
          title="Auto-Download"
          description="Automatically start download after URL analysis"
          left={props => <List.Icon {...props} icon="download" />}
          right={() => (
            <Switch
              value={autoDownload}
              onValueChange={() => dispatch(toggleAutoDownload())}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Notifications"
          description="Receive notifications when downloads complete"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={() => dispatch(toggleNotifications())}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Download Preferences</List.Subheader>
        
        <List.Item
          title="Default Download Type"
          description={`Currently: ${defaultDownloadType.charAt(0).toUpperCase() + defaultDownloadType.slice(1)}`}
          left={props => <List.Icon {...props} icon="file-video" />}
          onPress={() => {}}
        />
        
        <View style={styles.radioContainer}>
          <RadioButton.Group
            onValueChange={(value) => dispatch(setDefaultDownloadType(value as 'video' | 'audio' | 'auto'))}
            value={defaultDownloadType}
          >
            <View style={styles.radioItem}>
              <RadioButton value="video" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Video</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="audio" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Audio</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="auto" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Auto (Based on content)</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <List.Item
          title="Default Quality"
          description={`Currently: ${defaultQuality.charAt(0).toUpperCase() + defaultQuality.slice(1)}`}
          left={props => <List.Icon {...props} icon="high-definition" />}
          onPress={() => {}}
        />
        
        <View style={styles.radioContainer}>
          <RadioButton.Group
            onValueChange={(value) => dispatch(setDefaultQuality(value as 'highest' | 'medium' | 'lowest'))}
            value={defaultQuality}
          >
            <View style={styles.radioItem}>
              <RadioButton value="highest" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Highest Quality</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="medium" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Medium Quality</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="lowest" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Lowest Quality (Faster)</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <List.Item
          title="Download Location"
          description={downloadDirectory}
          left={props => <List.Icon {...props} icon="folder" />}
          onPress={() => {}}
        />
        
        <View style={styles.inputContainer}>
          <Button 
            mode="outlined" 
            onPress={() => dispatch(setDownloadDirectory('SocialSaver'))}
            style={{ marginHorizontal: 16, marginBottom: 8 }}
          >
            Reset to Default
          </Button>
        </View>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Clear Download History"
          description="Remove all download history records"
          left={props => <List.Icon {...props} icon="delete-sweep" />}
          onPress={() => {}}
        />
        <List.Item
          title="Clear Cache"
          description="Free up space by clearing temporary files"
          left={props => <List.Icon {...props} icon="cached" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => {}}
        />
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  radioContainer: {
    marginLeft: 72,
    marginRight: 16,
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    marginLeft: 56,
    marginRight: 16,
    marginBottom: 16,
  },
});

export default SettingsScreen;