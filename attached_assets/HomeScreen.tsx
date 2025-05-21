import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { Text, useTheme, Button, Card, Surface, Divider, Avatar, Dialog, Portal } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DownloadForm from '../components/DownloadForm';
import PlatformInfo from '../components/PlatformInfo';
import { RootState } from '../store';

const HomeScreen = () => {
  const theme = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [downloadResult, setDownloadResult] = useState<any>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleDownloadComplete = (result: any) => {
    setDownloadResult(result);
    setShowCompletionDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCompletionDialog(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Social Media Downloader</Text>
          <Text style={styles.subtitle}>
            Download videos and photos from YouTube, Instagram, Twitter, and more
          </Text>
          
          {/* Login button temporarily disabled for testing
          {!isAuthenticated && (
            <Button 
              mode="contained" 
              onPress={() => {}} 
              style={styles.loginButton}
              labelStyle={{ color: theme.colors.primary }}
              buttonColor={theme.colors.background}
            >
              Sign in for more features
            </Button>
          )}
          */}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <PlatformInfo 
            platform={selectedPlatform}
            description={`Download ${selectedPlatform === 'youtube' ? 'videos and audio' : 'content'} from ${selectedPlatform} with high quality and fast speed.`}
          />

          <DownloadForm onDownloadComplete={handleDownloadComplete} />
        </View>

        <Divider style={styles.divider} />

        <Surface style={[styles.featuresSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Why Use Our Downloader?
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Avatar.Icon 
                size={40} 
                icon="speedometer" 
                style={{ backgroundColor: theme.colors.primary + '20' }} 
                color={theme.colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  Super Fast Downloads
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Optimized servers for quick and reliable downloads
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Avatar.Icon 
                size={40} 
                icon="quality-high" 
                style={{ backgroundColor: theme.colors.primary + '20' }} 
                color={theme.colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  High Quality Options
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Download in HD, 4K, or save as audio files
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Avatar.Icon 
                size={40} 
                icon="shield-check" 
                style={{ backgroundColor: theme.colors.primary + '20' }} 
                color={theme.colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  Safe & Secure
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  No ads, malware, or tracking. Your privacy is protected.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Avatar.Icon 
                size={40} 
                icon="check-all" 
                style={{ backgroundColor: theme.colors.primary + '20' }} 
                color={theme.colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                  Multiple Platforms
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Support for YouTube, Instagram, Twitter, Facebook, TikTok and more
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        <Card style={styles.howToCard}>
          <Card.Cover 
            source={{ uri: 'https://picsum.photos/id/1/600/300' }} 
            style={styles.howToImage} 
          />
          <Card.Content style={styles.howToContent}>
            <Text style={[styles.howToTitle, { color: theme.colors.onSurface }]}>
              How to Download Videos
            </Text>
            <Text style={[styles.howToStep, { color: theme.colors.onSurfaceVariant }]}>
              1. Paste the video URL from any supported platform
            </Text>
            <Text style={[styles.howToStep, { color: theme.colors.onSurfaceVariant }]}>
              2. Select your preferred quality and format
            </Text>
            <Text style={[styles.howToStep, { color: theme.colors.onSurfaceVariant }]}>
              3. Click Download and save to your device
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => {}} 
              style={styles.howToButton}
            >
              Learn More
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Download Completion Dialog */}
      <Portal>
        <Dialog
          visible={showCompletionDialog}
          onDismiss={handleCloseDialog}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Download Complete</Dialog.Title>
          <Dialog.Content>
            {downloadResult?.metadata?.thumbnail && (
              <Image
                source={{ uri: downloadResult.metadata.thumbnail }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.dialogContentText}>
              {downloadResult?.metadata?.title || 'Your content'} has been successfully downloaded.
            </Text>
            {downloadResult?.metadata && (
              <View style={styles.metadataContainer}>
                <Text style={styles.metadataLabel}>Platform: </Text>
                <Text style={styles.metadataValue}>{downloadResult.metadata.platform}</Text>
                
                <Text style={styles.metadataLabel}>Type: </Text>
                <Text style={styles.metadataValue}>{downloadResult.metadata.type}</Text>
                
                <Text style={styles.metadataLabel}>Quality: </Text>
                <Text style={styles.metadataValue}>{downloadResult.metadata.quality}</Text>
                
                {downloadResult.metadata.fileSize && (
                  <>
                    <Text style={styles.metadataLabel}>Size: </Text>
                    <Text style={styles.metadataValue}>{downloadResult.metadata.fileSize}</Text>
                  </>
                )}
              </View>
            )}
            
            {/* Advertisement Space - Placeholder for future implementation */}
            <View style={styles.adPlaceholder}>
              <MaterialCommunityIcons name="advertisement-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.adText, { color: theme.colors.onSurfaceVariant }]}>
                Advertisement space (Temporarily disabled for testing)
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseDialog}>Close</Button>
            {Platform.OS !== 'web' && downloadResult?.filePath && (
              <Button 
                mode="contained" 
                onPress={() => {
                  handleCloseDialog();
                  // Here you could add code to view the file
                }}
              >
                View File
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 320,
  },
  loginButton: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  divider: {
    marginVertical: 20,
  },
  featuresSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  howToCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  howToImage: {
    height: 150,
  },
  howToContent: {
    padding: 16,
  },
  howToTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  howToStep: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  howToButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  thumbnailImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  dialogContentText: {
    marginBottom: 16,
    fontSize: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metadataLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  metadataValue: {
    marginRight: 12,
  },
  // Ad placeholder styles
  adPlaceholder: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  adText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HomeScreen;