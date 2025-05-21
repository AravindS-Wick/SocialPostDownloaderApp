import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Button, Surface, IconButton, useTheme, ActivityIndicator, Divider, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store';

interface PlatformConnectionState {
  [key: string]: {
    connected: boolean;
    username?: string;
    loading?: boolean;
    error?: string;
    autoConnect: boolean;
  };
}

const PlatformConnectScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [platforms, setPlatforms] = useState<PlatformConnectionState>({
    instagram: { connected: false, autoConnect: false },
    youtube: { connected: false, autoConnect: false },
    twitter: { connected: false, autoConnect: false },
    facebook: { connected: false, autoConnect: false },
    tiktok: { connected: false, autoConnect: false },
  });

  // User could be logged in or not
  const user = useSelector((state: RootState) => state.auth?.user);

  const handleConnect = async (platform: string) => {
    // Set loading state for this platform
    setPlatforms(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        loading: true,
        error: undefined
      }
    }));

    try {
      // Simulate API call for OAuth connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful connection
      const mockUsername = user ? user.username : `user_${Math.floor(Math.random() * 1000)}`;
      
      // Update platform state
      setPlatforms(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          connected: true,
          username: mockUsername,
          loading: false
        }
      }));

      // In a real app, you would dispatch to Redux and save to storage
      // dispatch(connectPlatform({ platform, username: mockUsername }));
      await AsyncStorage.setItem(`platform_${platform}`, JSON.stringify({ 
        connected: true,
        username: mockUsername,
        autoConnect: platforms[platform].autoConnect
      }));

    } catch (error) {
      console.error(`Connection error for ${platform}:`, error);
      setPlatforms(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          loading: false,
          error: 'Connection failed. Please try again.'
        }
      }));
    }
  };

  const handleDisconnect = async (platform: string) => {
    // Set loading state for this platform
    setPlatforms(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        loading: true
      }
    }));

    try {
      // Simulate API call for disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update platform state
      setPlatforms(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          connected: false,
          username: undefined,
          loading: false,
          error: undefined
        }
      }));

      // In a real app, you would dispatch to Redux and update storage
      // dispatch(disconnectPlatform(platform));
      await AsyncStorage.removeItem(`platform_${platform}`);

    } catch (error) {
      console.error(`Disconnection error for ${platform}:`, error);
      setPlatforms(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          loading: false,
          error: 'Disconnection failed. Please try again.'
        }
      }));
    }
  };

  const toggleAutoConnect = (platform: string) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        autoConnect: !prev[platform].autoConnect
      }
    }));

    // Save preference to AsyncStorage
    AsyncStorage.setItem(`platform_${platform}`, JSON.stringify({
      ...platforms[platform],
      autoConnect: !platforms[platform].autoConnect
    }));
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return '#E1306C';
      case 'youtube': return '#FF0000';
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#4267B2';
      case 'tiktok': return '#000000';
      default: return theme.colors.primary;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'instagram';
      case 'youtube': return 'youtube';
      case 'twitter': return 'twitter';
      case 'facebook': return 'facebook';
      case 'tiktok': return 'music-note';
      default: return 'connection';
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={[styles.headerSection, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Connect Your Accounts</Text>
        <Text style={styles.headerSubtitle}>
          Connect your social media accounts to download from private profiles and get personalized recommendations
        </Text>
      </Surface>

      <View style={styles.platformsContainer}>
        {Object.entries(platforms).map(([platform, status]) => (
          <Card 
            key={platform} 
            style={[styles.platformCard, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
          >
            <Card.Content>
              <View style={styles.platformHeader}>
                <MaterialCommunityIcons 
                  name={getPlatformIcon(platform) as any} 
                  size={32} 
                  color={getPlatformColor(platform)} 
                />
                <Text 
                  style={[styles.platformName, { color: theme.colors.onSurface }]}
                  variant="titleMedium"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
              </View>

              {status.connected ? (
                <View style={styles.connectedInfo}>
                  <View style={styles.usernameContainer}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      Connected as:
                    </Text>
                    <Text 
                      style={[styles.username, { color: theme.colors.onSurface }]}
                      variant="bodyMedium"
                    >
                      @{status.username}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text 
                  style={[styles.disconnectedText, { color: theme.colors.onSurfaceVariant }]}
                  variant="bodyMedium"  
                >
                  Not connected
                </Text>
              )}

              {status.error && (
                <Text style={styles.errorText}>
                  {status.error}
                </Text>
              )}

              <Divider style={styles.divider} />

              <View style={styles.actionRow}>
                {status.connected ? (
                  <Button 
                    mode="outlined" 
                    onPress={() => handleDisconnect(platform)}
                    loading={status.loading}
                    disabled={status.loading}
                    style={styles.actionButton}
                    textColor={theme.colors.error}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    mode="contained" 
                    onPress={() => handleConnect(platform)}
                    loading={status.loading}
                    disabled={status.loading}
                    style={[styles.actionButton, { backgroundColor: getPlatformColor(platform) }]}
                  >
                    Connect
                  </Button>
                )}
              </View>

              <View style={styles.autoConnectRow}>
                <Text 
                  style={{ color: theme.colors.onSurfaceVariant }}
                  variant="bodyMedium"
                >
                  Auto-connect when downloading
                </Text>
                <Switch
                  value={status.autoConnect}
                  onValueChange={() => toggleAutoConnect(platform)}
                  color={theme.colors.primary}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Surface style={[styles.infoSection, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text 
          style={[styles.infoTitle, { color: theme.colors.onSurface }]}
          variant="titleMedium"
        >
          Why Connect Your Accounts?
        </Text>
        
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons 
              name="lock" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.benefitIcon}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Access to private and protected content
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons 
              name="star" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.benefitIcon}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Higher quality download options
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons 
              name="account-check" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.benefitIcon}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Personalized recommendations
            </Text>
          </View>
        </View>

        <Text 
          style={[styles.privacyNote, { color: theme.colors.onSurfaceVariant }]}
          variant="bodySmall"
        >
          Your account credentials are securely stored and used only for accessing content you request.
          We never post on your behalf or access your personal data.
        </Text>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  headerSection: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  platformsContainer: {
    padding: 16,
    marginTop: -16,
  },
  platformCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  connectedInfo: {
    marginBottom: 8,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontWeight: '500',
  },
  disconnectedText: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#B00020',
    marginTop: 8,
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 120,
  },
  autoConnectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 12,
  },
  privacyNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default PlatformConnectScreen;