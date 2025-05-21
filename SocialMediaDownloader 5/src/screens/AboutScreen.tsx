import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { Text, Button, Card, List, Divider, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  const theme = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="cloud-download-outline" size={80} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Social Media Downloader
        </Text>
        <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          Version 1.0.0
        </Text>
      </View>

      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            About This App
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            Social Media Downloader is a powerful tool that allows you to download videos, photos, and audio from popular social media platforms including Instagram, YouTube, and Twitter.
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            This app is designed to be user-friendly, efficient, and respectful of your privacy. It works directly on your device without storing your content on external servers.
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Features
          </Text>
          <List.Item
            title="Multiple Platforms"
            description="Download from Instagram, YouTube, Twitter, and more"
            left={props => <List.Icon {...props} icon="apps" />}
          />
          <Divider />
          <List.Item
            title="High Quality"
            description="Choose from available resolutions including HD and 4K"
            left={props => <List.Icon {...props} icon="high-definition" />}
          />
          <Divider />
          <List.Item
            title="Formats"
            description="Download videos, photos, or extract audio"
            left={props => <List.Icon {...props} icon="file-multiple" />}
          />
          <Divider />
          <List.Item
            title="Download History"
            description="Keep track of your downloads"
            left={props => <List.Icon {...props} icon="history" />}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            How to Use
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            1. Copy the URL of the social media post you want to download
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            2. Paste the URL in the app's download field
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            3. Select the platform or use auto-detect
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            4. Choose your preferred quality and format
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            5. Download and enjoy your content offline!
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Legal Information
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            This app is intended for personal use only. Please respect copyright laws and terms of service of the platforms you download from.
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            Always ensure you have the right to download and use the content. Downloading copyrighted material without permission may be illegal in your country.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => handleOpenLink('https://example.com/privacy')}
          style={styles.footerButton}
        >
          Privacy Policy
        </Button>
        <Button
          mode="outlined"
          onPress={() => handleOpenLink('https://example.com/support')}
          style={styles.footerButton}
        >
          Contact Support
        </Button>
      </View>

      <Text style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>
        © 2024 Social Media Downloader
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  footerButton: {
    minWidth: 150,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});

export default AboutScreen;