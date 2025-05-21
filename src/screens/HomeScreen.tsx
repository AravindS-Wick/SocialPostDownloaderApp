import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { detectPlatformFromUrl } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();

  const handlePasteFromClipboard = async () => {
    try {
      // In a real implementation, we would use clipboard-expo here
      // Since we're in a web environment, we'll simulate this behavior
      const clipboardText = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      setUrl(clipboardText);
      const detectedPlatform = detectPlatformFromUrl(clipboardText);
      setPlatform(detectedPlatform);
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    if (text.trim()) {
      const detectedPlatform = detectPlatformFromUrl(text);
      setPlatform(detectedPlatform);
    } else {
      setPlatform('');
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    
    // Navigate to download screen with url and platform
    navigation.navigate('Download', { url, platform });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={24} color="red" />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={24} color="#C13584" />;
      case 'twitter':
      case 'x':
        return <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={24} color="#000000" />;
      case 'facebook':
        return <FontAwesome5 name="facebook" size={24} color="#4267B2" />;
      default:
        return <FontAwesome5 name="link" size={24} color="#777777" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Media Downloader</Text>
        {user && (
          <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.urlInputWrapper}>
          <TextInput
            style={styles.urlInput}
            placeholder="Paste video/image URL here"
            value={url}
            onChangeText={handleUrlChange}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={handlePasteFromClipboard}
          >
            <Ionicons name="clipboard-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {platform ? (
          <View style={styles.platformIndicator}>
            {getPlatformIcon(platform)}
            <Text style={styles.platformText}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)} detected
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.downloadButton, !url.trim() && styles.downloadButtonDisabled]}
          onPress={handleSubmit}
          disabled={!url.trim()}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
          <Ionicons name="arrow-down-circle-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Supported Platforms</Text>
        <View style={styles.platformsGrid}>
          <View style={styles.platformItem}>
            <FontAwesome5 name="youtube" size={32} color="red" />
            <Text style={styles.platformLabel}>YouTube</Text>
          </View>
          <View style={styles.platformItem}>
            <FontAwesome5 name="instagram" size={32} color="#C13584" />
            <Text style={styles.platformLabel}>Instagram</Text>
          </View>
          <View style={styles.platformItem}>
            <FontAwesome5 name="twitter" size={32} color="#1DA1F2" />
            <Text style={styles.platformLabel}>Twitter/X</Text>
          </View>
          <View style={styles.platformItem}>
            <FontAwesome5 name="tiktok" size={32} color="#000000" />
            <Text style={styles.platformLabel}>TikTok</Text>
          </View>
          <View style={styles.platformItem}>
            <FontAwesome5 name="facebook" size={32} color="#4267B2" />
            <Text style={styles.platformLabel}>Facebook</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>How to Download</Text>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Copy Link</Text>
            <Text style={styles.stepDescription}>
              Copy the video or image URL from the social media app
            </Text>
          </View>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Paste URL</Text>
            <Text style={styles.stepDescription}>
              Paste the URL in the input field above or tap the clipboard icon
            </Text>
          </View>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Options</Text>
            <Text style={styles.stepDescription}>
              Choose quality and format options for your download
            </Text>
          </View>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Download</Text>
            <Text style={styles.stepDescription}>
              Tap download and wait for the process to complete
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#3498db',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  urlInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  pasteButton: {
    padding: 8,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  platformText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  downloadButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featuredSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 15,
  },
  platformLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  instructionsSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#2c3e50',
  },
  stepDescription: {
    color: '#7f8c8d',
    fontSize: 14,
    lineHeight: 20,
  },
});