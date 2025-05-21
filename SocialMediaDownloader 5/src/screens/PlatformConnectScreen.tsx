import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { connectPlatform, disconnectPlatform } from '../store/slices/authSlice';

const PlatformConnectScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { connectedPlatforms } = useSelector((state: RootState) => state.auth);
  
  const [instagramUsername, setInstagramUsername] = useState('');
  const [youtubeUsername, setYoutubeUsername] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const isConnected = (platform: string) => {
    return connectedPlatforms.includes(platform);
  };

  const handleConnect = (platform: string) => {
    let username = '';
    
    switch (platform) {
      case 'instagram':
        username = instagramUsername;
        break;
      case 'youtube':
        username = youtubeUsername;
        break;
      case 'twitter':
        username = twitterUsername;
        break;
    }
    
    if (!username) {
      setSnackbarMessage('Please enter your username');
      setSnackbarVisible(true);
      return;
    }
    
    // In a real app, this would include authentication logic
    dispatch(connectPlatform(platform));
    setSnackbarMessage(`Connected to ${platform} successfully`);
    setSnackbarVisible(true);
  };

  const handleDisconnect = (platform: string) => {
    dispatch(disconnectPlatform(platform));
    setSnackbarMessage(`Disconnected from ${platform}`);
    setSnackbarVisible(true);
    
    // Clear the input field for the disconnected platform
    switch (platform) {
      case 'instagram':
        setInstagramUsername('');
        break;
      case 'youtube':
        setYoutubeUsername('');
        break;
      case 'twitter':
        setTwitterUsername('');
        break;
    }
  };

  const renderPlatformCard = (
    platform: string,
    title: string,
    description: string,
    iconName: string,
    username: string,
    setUsername: (text: string) => void
  ) => {
    const connected = isConnected(platform);
    
    return (
      <Card style={[styles.platformCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.platformHeader}>
            <Ionicons name={iconName as any} size={28} color={theme.colors.primary} />
            <View style={styles.platformTitleContainer}>
              <Text style={[styles.platformTitle, { color: theme.colors.onSurface }]}>
                {title}
              </Text>
              <Text style={[styles.platformDescription, { color: theme.colors.onSurfaceVariant }]}>
                {description}
              </Text>
            </View>
          </View>
          
          <View style={styles.platformControls}>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              disabled={connected}
              style={styles.usernameInput}
            />
            
            <Button
              mode={connected ? "outlined" : "contained"}
              onPress={() => connected ? handleDisconnect(platform) : handleConnect(platform)}
              style={styles.actionButton}
              textColor={connected ? theme.colors.error : undefined}
            >
              {connected ? "Disconnect" : "Connect"}
            </Button>
          </View>
          
          {connected && (
            <Text style={[styles.connectedStatus, { color: theme.colors.primary }]}>
              ✓ Connected
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Connect Platforms
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Connect your social media accounts to enhance downloads
        </Text>
      </View>

      <View style={styles.platformsContainer}>
        {renderPlatformCard(
          'instagram',
          'Instagram',
          'Access private posts, stories, and highlights',
          'logo-instagram',
          instagramUsername,
          setInstagramUsername
        )}
        
        {renderPlatformCard(
          'youtube',
          'YouTube',
          'Download videos including private and age-restricted',
          'logo-youtube',
          youtubeUsername,
          setYoutubeUsername
        )}
        
        {renderPlatformCard(
          'twitter',
          'Twitter',
          'Access protected tweets and higher quality media',
          'logo-twitter',
          twitterUsername,
          setTwitterUsername
        )}
      </View>

      <Text style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}>
        Note: We never store your passwords. Authentication is handled through secure OAuth.
      </Text>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  platformsContainer: {
    paddingHorizontal: 16,
  },
  platformCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  platformDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  platformControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInput: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    justifyContent: 'center',
    minWidth: 100,
  },
  connectedStatus: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 30,
  },
});

export default PlatformConnectScreen;