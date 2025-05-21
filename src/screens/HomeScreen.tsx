import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Button, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto-detect');
  const [downloadType, setDownloadType] = useState('video');
  const [quality, setQuality] = useState('high');

  const handlePasteFromClipboard = async () => {
    try {
      // In a real implementation, we would use clipboard-expo here
      // Since we're in a web environment, we'll simulate this behavior
      const clipboardText = 'outu.be/swID4lyPVu8?feature=shared';
      setUrl(clipboardText);
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const handleClearUrl = () => {
    setUrl('');
  };

  const handleSelectPlatform = (newPlatform: string) => {
    setPlatform(newPlatform);
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    navigation.navigate('Download', { url, platform });
  };

  const handleAnalyze = () => {
    if (!url.trim()) return;
    navigation.navigate('Download', { url, platform });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#3498db', '#2980b9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>Social Media Downloader</Text>
        <Text style={styles.subtitle}>
          Download videos and photos from YouTube, Instagram, Twitter, and more
        </Text>
      </LinearGradient>

      {/* Main Download Card */}
      <View style={styles.card}>
        <View style={styles.platformHeader}>
          <FontAwesome5 name="youtube" size={24} color="red" />
          <Text style={styles.platformTitle}>YouTube Downloader</Text>
        </View>
        
        <Text style={styles.platformDescription}>
          Download videos and audio from youtube with high quality and fast speed.
        </Text>
        
        {/* URL Input */}
        <View style={styles.urlInputContainer}>
          <View style={styles.urlInputWrapper}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste video/image URL here"
              value={url}
              onChangeText={setUrl}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            {url ? (
              <IconButton
                icon="close"
                size={20}
                onPress={handleClearUrl}
                style={styles.iconButton}
              />
            ) : (
              <IconButton
                icon="content-paste"
                size={20}
                onPress={handlePasteFromClipboard}
                style={styles.iconButton}
              />
            )}
          </View>
        </View>

        {/* Platform Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Platform</Text>
          <View style={styles.platformSelector}>
            <TouchableOpacity
              style={[
                styles.platformOption,
                platform === 'auto-detect' && styles.selectedPlatform,
              ]}
              onPress={() => handleSelectPlatform('auto-detect')}
            >
              <Ionicons name="sync-outline" size={18} color={platform === 'auto-detect' ? 'white' : '#333'} />
              <Text style={[
                styles.platformText,
                platform === 'auto-detect' && styles.selectedPlatformText,
              ]}>
                Auto-detect
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.platformOption,
                platform === 'youtube' && styles.selectedPlatform,
              ]}
              onPress={() => handleSelectPlatform('youtube')}
            >
              <FontAwesome5 name="youtube" size={18} color={platform === 'youtube' ? 'white' : 'red'} />
              <Text style={[
                styles.platformText,
                platform === 'youtube' && styles.selectedPlatformText,
              ]}>
                YouTube
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.platformOption,
                platform === 'instagram' && styles.selectedPlatform,
              ]}
              onPress={() => handleSelectPlatform('instagram')}
            >
              <FontAwesome5 name="instagram" size={18} color={platform === 'instagram' ? 'white' : '#C13584'} />
              <Text style={[
                styles.platformText,
                platform === 'instagram' && styles.selectedPlatformText,
              ]}>
                Instagram
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Download Type Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Download Type</Text>
          <View style={styles.downloadTypeSelector}>
            <TouchableOpacity
              style={[
                styles.downloadTypeOption,
                { flex: 1, borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                downloadType === 'video' && styles.selectedDownloadType,
              ]}
              onPress={() => setDownloadType('video')}
            >
              <FontAwesome5 name="video" size={16} color={downloadType === 'video' ? 'white' : '#333'} />
              <Text style={[
                styles.downloadTypeText,
                downloadType === 'video' && styles.selectedDownloadTypeText,
              ]}>
                Video
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.downloadTypeOption,
                { flex: 1, borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                downloadType === 'audio' && styles.selectedDownloadType,
              ]}
              onPress={() => setDownloadType('audio')}
            >
              <FontAwesome5 name="music" size={16} color={downloadType === 'audio' ? 'white' : '#333'} />
              <Text style={[
                styles.downloadTypeText,
                downloadType === 'audio' && styles.selectedDownloadTypeText,
              ]}>
                Audio
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quality Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Quality</Text>
          <View style={styles.qualitySelector}>
            <TouchableOpacity
              style={[
                styles.qualityOption,
                { flex: 1, borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                quality === 'high' && styles.selectedQuality,
              ]}
              onPress={() => setQuality('high')}
            >
              <Text style={[
                styles.qualityText,
                quality === 'high' && styles.selectedQualityText,
              ]}>
                HD High
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.qualityOption,
                { flex: 1 },
                quality === 'medium' && styles.selectedQuality,
              ]}
              onPress={() => setQuality('medium')}
            >
              <Text style={[
                styles.qualityText,
                quality === 'medium' && styles.selectedQualityText,
              ]}>
                Medium
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.qualityOption,
                { flex: 1, borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                quality === 'low' && styles.selectedQuality,
              ]}
              onPress={() => setQuality('low')}
            >
              <Text style={[
                styles.qualityText,
                quality === 'low' && styles.selectedQualityText,
              ]}>
                Low
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.downloadButton}
            disabled={!url.trim()}
            icon="download"
          >
            Download
          </Button>

          <Button
            mode="outlined"
            onPress={handleAnalyze}
            style={styles.analyzeButton}
            disabled={!url.trim()}
            icon="magnify"
          >
            Analyze
          </Button>
        </View>
        
        {/* Error message if any */}
        <Text style={styles.errorText}>
          Call to function 'ExpoMediaLibrary.getAlbumAsync' has been rejected.
          {'\n'}Caused by: Missing MEDIA_LIBRARY permissions.
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>© 2025 Social Media Downloader</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
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
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    maxWidth: '90%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: -15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  platformDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  // URL Input styles
  urlInputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  urlInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  iconButton: {
    margin: 0,
  },
  // Section containers
  sectionContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  // Platform selector
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPlatform: {
    backgroundColor: '#e74c3c',
  },
  platformText: {
    marginLeft: 6,
    color: '#333',
  },
  selectedPlatformText: {
    color: 'white',
  },
  // Download type selector
  downloadTypeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 8,
  },
  downloadTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
  },
  selectedDownloadType: {
    backgroundColor: '#3498db',
  },
  downloadTypeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  selectedDownloadTypeText: {
    color: 'white',
  },
  // Quality selector
  qualitySelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    overflow: 'hidden',
  },
  qualityOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
  },
  selectedQuality: {
    backgroundColor: '#3498db',
  },
  qualityText: {
    fontSize: 14,
    color: '#333',
  },
  selectedQualityText: {
    color: 'white',
  },
  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#3498db',
  },
  analyzeButton: {
    flex: 1,
    borderColor: '#3498db',
  },
  // Error message
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
});