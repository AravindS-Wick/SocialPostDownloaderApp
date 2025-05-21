import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, Card, Button, Surface, TextInput, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { detectPlatformFromUrl } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

// Social platform information with icons and examples
const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Download videos in various resolutions or audio only.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    example: 'https://www.instagram.com/p/example123/',
    description: 'Download posts, reels, and stories.',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: 'twitter',
    color: '#1DA1F2',
    example: 'https://twitter.com/user/status/123456789',
    description: 'Download tweets, videos, and images.',
  },
];

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [url, setUrl] = useState('');

  // Handle download button press
  const handleDownload = () => {
    if (!url.trim()) {
      return;
    }
    
    const platform = detectPlatformFromUrl(url);
    navigation.navigate('Download', { url, platform });
  };

  // Navigate to platform-specific download screen
  const navigateToPlatform = (platformId: string) => {
    navigation.navigate('Download', { platform: platformId });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Quick Download Card */}
      <Surface style={[styles.downloadCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          SocialSaver
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Download content from social media
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            label="Paste Link Here"
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            right={
              url ? (
                <TextInput.Icon 
                  icon="close" 
                  onPress={() => setUrl('')} 
                />
              ) : undefined
            }
          />
          <Button 
            mode="contained"
            onPress={handleDownload}
            style={styles.downloadButton}
            disabled={!url.trim()}
          >
            Download
          </Button>
        </View>
      </Surface>

      {/* Supported Platforms */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Supported Platforms
      </Text>
      
      {platforms.map(platform => (
        <Card 
          key={platform.id} 
          style={[styles.platformCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateToPlatform(platform.id)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: platform.color }]}>
              <Feather name={platform.icon as any} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.platformInfo}>
              <Text style={[styles.platformName, { color: theme.colors.text }]}>
                {platform.name}
              </Text>
              <Text style={[styles.platformDesc, { color: theme.colors.text }]}>
                {platform.description}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Help Section */}
      <Surface style={[styles.helpCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.helpTitle, { color: theme.colors.primary }]}>
          How to use SocialSaver
        </Text>
        <View style={styles.helpStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={[styles.stepText, { color: theme.colors.text }]}>
            Copy the link of the content you want to download
          </Text>
        </View>
        <View style={styles.helpStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={[styles.stepText, { color: theme.colors.text }]}>
            Paste the link in the input field above
          </Text>
        </View>
        <View style={styles.helpStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={[styles.stepText, { color: theme.colors.text }]}>
            Select quality and format, then download
          </Text>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  downloadCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  downloadButton: {
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  platformCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  platformDesc: {
    fontSize: 14,
  },
  helpCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
  },
});

export default MainScreen;
