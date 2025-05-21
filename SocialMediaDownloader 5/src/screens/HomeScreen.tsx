import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import DownloadForm from '../components/DownloadForm';
import PlatformInfo from '../components/PlatformInfo';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = (url: string, platform: string) => {
    if (!url) {
      setUrlError('Please enter a valid URL');
      return;
    }
    setUrlError(null);
    
    // Navigate to download screen with the URL and platform
    navigation.navigate('Download', { url, platform });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, '#2d456e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Social Media Downloader</Text>
          <Text style={styles.subtitle}>
            Download videos and photos from Instagram, YouTube, and Twitter
          </Text>
        </LinearGradient>
      </View>

      <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.formTitle, { color: theme.colors.primary }]}>
          Enter URL to Download
        </Text>
        
        <DownloadForm onSubmit={handleSubmit} error={urlError} />
        
        {urlError && (
          <Text style={styles.errorText}>{urlError}</Text>
        )}
      </Surface>

      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: theme.colors.primary }]}>
          Supported Platforms
        </Text>
        
        <View style={styles.platformsGrid}>
          <PlatformInfo 
            platform="instagram" 
            title="Instagram"
            description="Download reels, stories, photos, and IGTV videos"
          />
          <PlatformInfo 
            platform="youtube" 
            title="YouTube"
            description="Download videos in various resolutions and audio tracks"
          />
          <PlatformInfo 
            platform="twitter" 
            title="Twitter"
            description="Download videos, photos, and GIFs from tweets"
          />
        </View>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('About')}
          style={styles.aboutButton}
        >
          Learn More
        </Button>
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
    marginBottom: 20,
  },
  headerGradient: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  infoSection: {
    marginHorizontal: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  aboutButton: {
    marginTop: 24,
    alignSelf: 'center',
  },
});

export default HomeScreen;