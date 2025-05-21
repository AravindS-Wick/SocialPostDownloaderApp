import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, Card, Button, Surface, TextInput, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useSpring, animated } from '@react-spring/native';
import { detectPlatformFromUrl } from '../services/api';

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: 'twitter',
    color: '#1DA1F2',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
  }
];

const MainScreen = ({ navigation }) => {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      if (!url.trim()) {
        setError('Please enter a URL');
        return;
      }
      const platform = detectPlatformFromUrl(url);
      navigation.navigate('Download', { url, platform });
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  const AnimatedCard = animated(Card);
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  });

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.title}>Social Media Downloader</Text>
        <Text style={styles.subtitle}>Download videos and photos from social media</Text>
      </Surface>

      <AnimatedCard style={[styles.downloadCard, fadeIn]}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Paste URL here"
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setError('');
            }}
            error={!!error}
            right={url ? <TextInput.Icon icon="close" onPress={() => setUrl('')} /> : null}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleDownload}
            style={styles.downloadButton}
            icon="download"
          >
            Download
          </Button>
        </Card.Content>
      </AnimatedCard>

      <Text style={styles.sectionTitle}>Supported Platforms</Text>
      {platforms.map((platform) => (
        <AnimatedCard
          key={platform.id}
          style={[styles.platformCard, fadeIn]}
          onPress={() => navigation.navigate('Download', { platform: platform.id })}
        >
          <Card.Content style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: platform.color }]}>
              <Feather name={platform.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.platformName}>{platform.name}</Text>
          </Card.Content>
        </AnimatedCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  downloadCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  errorText: {
    color: '#FF5252',
    marginTop: 4,
  },
  downloadButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  platformCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
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
  platformName: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default MainScreen;