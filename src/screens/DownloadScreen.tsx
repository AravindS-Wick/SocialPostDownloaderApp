import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, ActivityIndicator, useTheme, Chip, Divider } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAvailableResolutions, setDownloadType, setIsDownloading, setProgress } from '../store/slices/downloadSlice';
import { addDownloadToHistory } from '../store/slices/historySlice';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DownloadService, { DownloadOptions, DownloadProgress } from '../services/DownloadService';
import { detectPlatformFromUrl } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { logDownloadAttempt, logDownloadComplete } from '../services/logger';
import ResponsiveContainer from '../components/ResponsiveContainer';

type DownloadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Download'>;
type DownloadScreenRouteProp = RouteProp<RootStackParamList, 'Download'>;

interface DownloadScreenProps {
  navigation: DownloadScreenNavigationProp;
  route: DownloadScreenRouteProp;
}

const DownloadScreen: React.FC<DownloadScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isDownloading, progress, availableResolutions } = useSelector(
    (state: RootState) => state.download
  );
  const { qualityPreference } = useSelector((state: RootState) => state.settings);

  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [selectedType, setSelectedType] = useState<'video' | 'audio'>('video');

  useEffect(() => {
    navigation.setOptions({
      title: 'Download Content',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (route.params) {
      const { url: routeUrl, platform: routePlatform } = route.params;
      if (routeUrl) {
        setUrl(routeUrl);
        const detectedPlatform = routePlatform || detectPlatformFromUrl(routeUrl);
        setPlatform(detectedPlatform);
        fetchMediaInfo(routeUrl);
      }
    }
  }, [route.params]);

  const fetchMediaInfo = async (mediaUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      await logDownloadAttempt(mediaUrl, platform);

      const info = await DownloadService.getMediaInfo(mediaUrl);
      setMediaInfo(info);

      if (info.qualities) {
        dispatch(setAvailableResolutions(info.qualities));
        if (info.qualities.length > 0) {
          setSelectedQuality(info.qualities[0]);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching media info:', err);
      setError('Failed to get information about the media. Please check the URL and try again.');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url || isDownloading) return;

    try {
      dispatch(setIsDownloading(true));
      setError(null);

      const downloadOptions: DownloadOptions = {
        url,
        platform,
        type: selectedType,
        quality: qualityPreference === 'manual' ? (selectedQuality || 'best') : qualityPreference,
        format: 'best',
        title: mediaInfo?.title || 'Downloaded Content',
        useAutoFormat: true,
      };

      const result = await DownloadService.downloadContent(
        downloadOptions,
        (downloadProgress: DownloadProgress) => {
          dispatch(setProgress(downloadProgress.progress));
        }
      );

      if (result && result.success && result.metadata) {
        const historyItem = {
          id: uuidv4(),
          url,
          title: result.metadata.title,
          thumbnail: result.metadata.thumbnail,
          platform,
          type: selectedType,
          quality: selectedQuality,
          createdAt: new Date().toISOString(),
          fileSize: result.metadata.fileSize,
          filePath: result.filePath,
        };

        dispatch(addDownloadToHistory(historyItem));
        await logDownloadComplete(url, platform, selectedType, result.metadata.title);

        Alert.alert(
          'Download Complete',
          `Successfully downloaded "${result.metadata.title}"`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        setError(result.error || 'Failed to download. Please try again.');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('An unexpected error occurred during download.');
    } finally {
      dispatch(setIsDownloading(false));
    }
  };

  const handleTypeSelect = (type: 'video' | 'audio') => {
    setSelectedType(type);
    dispatch(setDownloadType(type));
  };

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={24} color="red" />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={24} color="#C13584" />;
      case 'twitter':
      case 'x':
        return <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={24} color={theme.dark ? '#FFFFFF' : '#000000'} />;
      case 'facebook':
        return <FontAwesome5 name="facebook" size={24} color="#4267B2" />;
      default:
        return <FontAwesome5 name="link" size={24} color={theme.colors.onSurfaceVariant} />;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ResponsiveContainer>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Fetching media information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button
            mode="contained"
            onPress={() => fetchMediaInfo(url)}
            style={styles.retryButton}
          >
            Retry
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </View>
      ) : mediaInfo ? (
        <View style={styles.contentContainer}>
          {/* Media Preview */}
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: mediaInfo.thumbnail || 'https://via.placeholder.com/300x200' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={[styles.platformBadge, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}>
              {getPlatformIcon()}
              <Text style={[styles.platformText, { color: theme.colors.onSurface }]}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Text>
            </View>
          </View>

          {/* Media Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{mediaInfo.title}</Text>
            {mediaInfo.author && (
              <Text style={[styles.author, { color: theme.colors.onSurfaceVariant }]}>by {mediaInfo.author}</Text>
            )}
            {mediaInfo.duration && (
              <Text style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
                Duration: {Math.floor(mediaInfo.duration / 60)}:{(mediaInfo.duration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Download Options */}
          <View style={styles.optionsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Download Options</Text>

            <View style={styles.typeSelectionContainer}>
              <Text style={[styles.optionLabel, { color: theme.colors.onSurfaceVariant }]}>Format:</Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[styles.typeButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }, selectedType === 'video' && styles.selectedTypeButton]}
                  onPress={() => handleTypeSelect('video')}
                >
                  <Ionicons name="videocam" size={22} color={selectedType === 'video' ? 'white' : theme.colors.primary} />
                  <Text style={[styles.typeText, { color: theme.colors.onSurfaceVariant }, selectedType === 'video' && styles.selectedTypeText]}>Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }, selectedType === 'audio' && styles.selectedTypeButton]}
                  onPress={() => handleTypeSelect('audio')}
                >
                  <Ionicons name="musical-notes" size={22} color={selectedType === 'audio' ? 'white' : theme.colors.primary} />
                  <Text style={[styles.typeText, { color: theme.colors.onSurfaceVariant }, selectedType === 'audio' && styles.selectedTypeText]}>Audio Only</Text>
                </TouchableOpacity>
              </View>
            </View>

            {qualityPreference !== 'manual' ? (
              <View style={styles.qualityContainer}>
                <Text style={[styles.optionLabel, { color: theme.colors.onSurfaceVariant }]}>Quality:</Text>
                <Chip icon="auto-fix" style={styles.qualityChip} mode="flat">
                  {qualityPreference === 'best' ? 'Auto (best available)' : `Default: ${qualityPreference}`}
                </Chip>
              </View>
            ) : (
              <>
                {selectedType === 'video' && availableResolutions.length > 0 && (
                  <View style={styles.qualityContainer}>
                    <Text style={[styles.optionLabel, { color: theme.colors.onSurfaceVariant }]}>Quality:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.qualityScrollView}>
                      {availableResolutions.map((q) => (
                        <Chip
                          key={q}
                          selected={selectedQuality === q}
                          onPress={() => setSelectedQuality(q)}
                          style={styles.qualityChip}
                          selectedColor={selectedQuality === q ? 'white' : undefined}
                          mode={selectedQuality === q ? 'flat' : 'outlined'}
                        >
                          {q}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedType === 'audio' && mediaInfo.audioQualities && (
                  <View style={styles.qualityContainer}>
                    <Text style={[styles.optionLabel, { color: theme.colors.onSurfaceVariant }]}>Audio Quality:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.qualityScrollView}>
                      {mediaInfo.audioQualities.map((q: string) => (
                        <Chip
                          key={q}
                          selected={selectedQuality === q}
                          onPress={() => setSelectedQuality(q)}
                          style={styles.qualityChip}
                          selectedColor={selectedQuality === q ? 'white' : undefined}
                          mode={selectedQuality === q ? 'flat' : 'outlined'}
                        >
                          {q}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Download Button and Progress */}
          <View style={styles.downloadContainer}>
            {isDownloading ? (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                <View style={[styles.progressBarOuter, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View
                    style={[
                      styles.progressBarInner,
                      { width: `${progress}%`, backgroundColor: theme.colors.primary },
                    ]}
                  />
                </View>
                <Text style={[styles.downloadingText, { color: theme.colors.onSurfaceVariant }]}>Downloading...</Text>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleDownload}
                style={styles.downloadButton}
                icon="download"
              >
                Download {selectedType === 'video' ? 'Video' : 'Audio'}
              </Button>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No media information available</Text>
        </View>
      )}
      </ResponsiveContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, minHeight: 300 },
  loadingText: { marginTop: 15, fontSize: 16 },
  errorContainer: { padding: 30, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  errorText: { marginTop: 10, marginBottom: 20, fontSize: 16, textAlign: 'center' },
  retryButton: { marginBottom: 10, width: 200 },
  backButton: { width: 200 },
  contentContainer: { padding: 15 },
  previewContainer: {
    position: 'relative', marginBottom: 15, borderRadius: 12, overflow: 'hidden',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  thumbnail: { width: '100%', height: 200 },
  platformBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, flexDirection: 'row', alignItems: 'center',
  },
  platformText: { marginLeft: 5, fontWeight: 'bold' },
  infoContainer: { marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  author: { fontSize: 16, marginBottom: 5 },
  duration: { fontSize: 14 },
  divider: { marginVertical: 15 },
  optionsContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  typeSelectionContainer: { marginBottom: 20 },
  optionLabel: { fontSize: 16, marginBottom: 8 },
  typeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8,
    borderWidth: 1, flex: 0.48,
  },
  selectedTypeButton: { backgroundColor: '#3498db', borderColor: '#3498db' },
  typeText: { marginLeft: 8, fontSize: 16 },
  selectedTypeText: { color: 'white' },
  qualityContainer: { marginBottom: 15 },
  qualityScrollView: { flexDirection: 'row' },
  qualityChip: { marginRight: 8, marginVertical: 4 },
  downloadContainer: { marginTop: 10 },
  downloadButton: { paddingVertical: 8 },
  progressContainer: { alignItems: 'center', marginTop: 10 },
  progressText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#3498db' },
  progressBarOuter: { width: '100%', height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarInner: { height: '100%', borderRadius: 5 },
  downloadingText: { marginTop: 8 },
  emptyContainer: { padding: 30, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  emptyText: { fontSize: 16 },
});

export default DownloadScreen;
