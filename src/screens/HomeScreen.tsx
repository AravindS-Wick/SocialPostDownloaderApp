import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  AppState,
  Clipboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Button, IconButton, Card, Avatar, ProgressBar, Chip, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { checkAndRequestPermissions } from '../services/permissions';
import { addDownloadToHistory, DownloadHistoryItem } from '../store/slices/historySlice';
import ResponsiveContainer from '../components/ResponsiveContainer';
// TODO: Ad display - backlog
// import AdBanner from '../components/ads/AdBanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface QualityOption {
  label: string;
  filesize: number | null;
}

interface PreviewData {
  title: string;
  author: string;
  duration: string;
  availableQualities: QualityOption[];
  thumbnail: string;
  description: string;
  views: string;
  likes: string;
  publishDate: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Home'>>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const downloads = useSelector((state: RootState) => state.history.downloads);
  const { qualityPreference, notificationsEnabled } = useSelector((state: RootState) => state.settings);

  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto-detect');
  const [downloadType, setDownloadType] = useState('video');
  const [quality, setQuality] = useState<string>(qualityPreference !== 'manual' ? qualityPreference : '1080p');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>([
    { label: '1080p', filesize: null },
    { label: '720p', filesize: null },
    { label: '480p', filesize: null },
    { label: '360p', filesize: null },
  ]);

  // Sync quality selection when default preference changes in Settings
  useEffect(() => {
    if (qualityPreference !== 'manual') {
      setQuality(qualityPreference);
    }
  }, [qualityPreference]);

  // Handle redownload params from HistoryScreen navigation
  useEffect(() => {
    const params = route.params;
    if (params?.redownloadUrl) {
      setUrl(params.redownloadUrl);
      detectPlatform(params.redownloadUrl);
      if (params.redownloadType) {
        setDownloadType(params.redownloadType);
      }
      // Clear the params so they don't re-trigger on tab switch
      navigation.setParams({ redownloadUrl: undefined, redownloadPlatform: undefined, redownloadType: undefined } as any);
    }
  }, [route.params]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'web') return;
      const hasPermissions = await checkAndRequestPermissions();
      if (!hasPermissions) {
        setShowError(true);
        setErrorMessage('Media library permissions are required to save downloads.');
      }
    };
    checkPermissions();
  }, []);

  // Debounce ref — prevents firing /api/info on every keystroke
  const analyzeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect social media URLs from clipboard when app comes to foreground
  const lastClipboardUrl = useRef<string | null>(null);
  useEffect(() => {
    const socialUrlPattern = /https?:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com|twitter\.com|x\.com)\//i;
    // tiktok\.com|facebook\.com|fb\.watch — coming soon

    const checkClipboardForUrl = async () => {
      try {
        // Don't prompt if the input is already filled (e.g. share intent just set it)
        if (url) return;
        const clipText = await Clipboard.getString();
        if (!clipText || clipText === lastClipboardUrl.current) return;
        const match = clipText.match(socialUrlPattern);
        if (match) {
          lastClipboardUrl.current = clipText;
          Alert.alert(
            'URL Detected',
            'A social media link was found in your clipboard. Use it?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Paste',
                onPress: () => {
                  const urlMatch = clipText.match(/https?:\/\/[^\s]+/i);
                  if (urlMatch) {
                    setUrl(urlMatch[0]);
                    detectPlatform(urlMatch[0]);
                    scheduleAnalyze(urlMatch[0]);
                  }
                },
              },
            ]
          );
        }
      } catch {
        // Clipboard access may fail silently
      }
    };

    // Check on mount
    checkClipboardForUrl();

    // Check when app comes back to foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkClipboardForUrl();
      }
    });

    return () => subscription.remove();
  }, [url]);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      if (clipboardText) {
        setUrl(clipboardText);
        detectPlatform(clipboardText);
        scheduleAnalyze(clipboardText);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const scheduleAnalyze = (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    if (analyzeDebounceRef.current) clearTimeout(analyzeDebounceRef.current);
    analyzeDebounceRef.current = setTimeout(() => {
      analyzeDebounceRef.current = null;
      runAnalyze(targetUrl.trim());
    }, 800);
  };

  const handleClearUrl = () => {
    setUrl('');
    setShowPreview(false);
    setPreviewData(null);
    setAvailableQualities([
      { label: '1080p', filesize: null },
      { label: '720p', filesize: null },
      { label: '480p', filesize: null },
      { label: '360p', filesize: null },
    ]);
    setQuality(qualityPreference !== 'manual' ? qualityPreference : '1080p');
  };

  const detectPlatform = (inputUrl: string) => {
    if (inputUrl.includes('youtube') || inputUrl.includes('youtu.be')) {
      setPlatform('youtube');
    } else if (inputUrl.includes('instagram')) {
      setPlatform('instagram');
    } else if (inputUrl.includes('twitter') || inputUrl.includes('x.com')) {
      setPlatform('twitter');
    // } else if (inputUrl.includes('tiktok')) {  // TikTok: coming soon
    //   setPlatform('tiktok');
    // } else if (inputUrl.includes('facebook')) {  // Facebook: coming soon
    //   setPlatform('facebook');
    } else {
      setPlatform('auto-detect');
    }
  };

  const handleSelectPlatform = (newPlatform: string) => {
    setPlatform(newPlatform);
  };

  const handleDownload = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setProgress(0);
    setShowError(false);

    try {
      const DownloadService = (await import('../services/DownloadService')).default;

      const downloadOptions = {
        url,
        type: downloadType as 'video' | 'audio' | 'image',
        quality,
        platform,
        useAutoFormat: true,
        saveLocation: 'media_library' as const,
      };

      const result = await DownloadService.downloadContent(
        downloadOptions,
        (progressData) => setProgress(progressData.progress)
      );

      setLoading(false);

      if (result.success) {
        if (result.metadata) {
          dispatch(addDownloadToHistory({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            url,
            title: result.metadata.title,
            thumbnail: result.metadata.thumbnail,
            platform,
            type: downloadType as 'video' | 'audio' | 'image',
            quality,
            createdAt: new Date().toISOString(),
            fileSize: result.metadata.fileSize,
            filePath: result.filePath,
          }));
        }
        if (Platform.OS !== 'web' && notificationsEnabled) {
          Alert.alert(
            'Download Complete',
            `Successfully downloaded "${result.metadata?.title || 'content'}" and saved to ${result.savedLocation}!`,
            [{ text: 'OK' }]
          );
        }
      } else {
        const errorMsg = result.error || 'Download could not be completed. Please try again.';
        setErrorMessage(errorMsg);
        setShowError(true);
        if (Platform.OS !== 'web') {
          Alert.alert('Download Failed', errorMsg);
        }
      }
    } catch (error: any) {
      setLoading(false);
      setProgress(0);

      let errorMsg = 'There was an error downloading your content. Please try again.';
      if (error?.message) {
        errorMsg = error.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.response?.status) {
        errorMsg = `Server error (${error.response.status}). Please try again.`;
      }

      setErrorMessage(errorMsg);
      setShowError(true);
      if (Platform.OS !== 'web') {
        Alert.alert('Download Failed', errorMsg);
      }
    }
  };

  const runAnalyze = async (targetUrl: string) => {
    setLoading(true);
    setProgress(0);

    try {
      const { downloadAPI } = await import('../services/api');

      setProgress(10);
      const mediaInfo = await downloadAPI.getMediaInfo(targetUrl);
      setProgress(100);

      setLoading(false);

      // Build QualityOption list — prefer qualitiesWithSize from API, fall back to plain strings
      const fetchedQualities: QualityOption[] = mediaInfo?.qualitiesWithSize?.length
        ? mediaInfo.qualitiesWithSize
        : mediaInfo?.qualities?.length
          ? (mediaInfo.qualities as string[]).map((label: string) => ({ label, filesize: null }))
          : mediaInfo?.formats
              ?.map((f: any) => f.quality || f.format_note)
              ?.filter(Boolean)
              ?.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
              ?.map((label: string) => ({ label, filesize: null }))
            ?? [
                { label: '1080p', filesize: null },
                { label: '720p', filesize: null },
                { label: '480p', filesize: null },
                { label: '360p', filesize: null },
              ];

      setAvailableQualities(fetchedQualities);
      if (fetchedQualities.length > 0 && !fetchedQualities.some(q => q.label === quality)) {
        setQuality(fetchedQualities[0].label);
      }

      // Auto-detect image-only posts (e.g. Instagram photos): no video or audio qualities
      const hasNoVideoQualities = !mediaInfo?.qualities?.length && !mediaInfo?.formats?.length;
      const hasNoAudioQualities = !mediaInfo?.audioQualities?.length;
      if (hasNoVideoQualities && hasNoAudioQualities) {
        setDownloadType('image');
      }

      setShowPreview(true);
      setPreviewData({
        title: mediaInfo?.title || 'Media Content',
        author: mediaInfo?.uploader || mediaInfo?.channel || 'Content Creator',
        duration: mediaInfo?.duration
          ? `${Math.floor(mediaInfo.duration / 60)}:${(mediaInfo.duration % 60).toString().padStart(2, '0')}`
          : 'Unknown',
        availableQualities: fetchedQualities,
        thumbnail: mediaInfo?.thumbnail || '',
        description: mediaInfo?.description || 'No description available.',
        views: mediaInfo?.view_count ? formatCount(mediaInfo.view_count) : 'Unknown',
        likes: mediaInfo?.like_count ? formatCount(mediaInfo.like_count) : 'Unknown',
        publishDate: mediaInfo?.upload_date ? formatDate(mediaInfo.upload_date) : 'Unknown',
      });
    } catch (error: any) {
      console.error('Error analyzing URL:', error);
      setLoading(false);
      setProgress(0);
      const isRateLimit = error?.isRateLimit || error?.response?.status === 429;
      const apiError = error?.response?.data?.error;
      Alert.alert(
        isRateLimit ? 'Slow Down' : 'Analysis Failed',
        isRateLimit
          ? error.message || 'Too many requests. Please wait a moment and try again.'
          : apiError || 'There was an error analyzing this URL. Please check the URL and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAnalyze = () => {
    if (!url.trim()) return;
    scheduleAnalyze(url);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)}GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)}MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${bytes}B`;
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateStr: string): string => {
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}`).toLocaleDateString();
    }
    return dateStr;
  };

  const getPlatformIcon = (platformName: string, size: number = 24, color?: string) => {
    switch (platformName) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={size} color={color || '#FF0000'} />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={size} color={color || '#C13584'} />;
      case 'twitter':
        return <FontAwesome5 name="twitter" size={size} color={color || '#1DA1F2'} />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={size} color={color || '#000000'} />;
      case 'facebook':
        return <FontAwesome5 name="facebook-square" size={size} color={color || '#4267B2'} />;
      default:
        return <MaterialIcons name="public" size={size} color={color || '#888888'} />;
    }
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    setUrl(item.url);
    detectPlatform(item.url);
    setDownloadType(item.type);
    if (qualityPreference === 'manual') {
      setQuality(item.quality);
    }
    scheduleAnalyze(item.url);
  };

  const renderDownloadItem = (item: DownloadHistoryItem) => (
    <Card key={item.id} style={styles.historyCard}>
      <Card.Title
        title={item.title}
        subtitle={`${item.platform} · ${item.type} · ${item.quality}`}
        left={(props) => getPlatformIcon(item.platform, props.size)}
        right={(props) => (
          <IconButton
            {...props}
            icon="download"
            onPress={() => handleRedownload(item)}
          />
        )}
      />
      <Card.Content>
        <View style={styles.historyCardContent}>
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.historyThumbnail}
              resizeMode="cover"
            />
          ) : null}
          <View style={styles.historyDetails}>
            {item.fileSize && (
              <Text style={[styles.historyDetailText, { color: theme.colors.onSurfaceVariant }]}>
                <Text style={styles.historyDetailLabel}>Size: </Text>
                {item.fileSize}
              </Text>
            )}
            <Text style={[styles.historyDetailText, { color: theme.colors.onSurfaceVariant }]}>
              <Text style={styles.historyDetailLabel}>Date: </Text>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Chip style={styles.historyChip}>{item.type}</Chip>
              <Chip style={styles.historyChip}>{item.quality}</Chip>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} nestedScrollEnabled={false}>
      <ResponsiveContainer>
      {/* Header */}
      <LinearGradient
        colors={['#7F00FF', '#E100FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.titleAndAuthContainer}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Social Media Downloader</Text>
            <Text style={styles.subtitle}>
              Download videos, photos, and music from all your favorite platforms
            </Text>
          </View>
          <View style={styles.authButtonsContainer}>
            {!user ? (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Auth')}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => navigation.navigate('Auth')}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Avatar.Text size={36} label={user.username?.charAt(0)?.toUpperCase() || 'U'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Main Download Card */}
      <View style={styles.cardContainer}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? 'rgba(127,0,255,0.3)' : 'rgba(127,0,255,0.1)' }]}>
          <Card.Content>
            {/* URL Input */}
            <View style={styles.urlInputContainer}>
              <View style={[styles.urlInputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <TextInput
                  style={[styles.urlInput, { color: theme.colors.onSurface }]}
                  placeholder="Paste video/image URL here"
                  value={url}
                  onChangeText={(text) => {
                    setUrl(text);
                    detectPlatform(text);
                    scheduleAnalyze(text);
                  }}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  autoCapitalize="none"
                />
                {url ? (
                  <IconButton icon="close" size={20} onPress={handleClearUrl} style={styles.iconButton} />
                ) : (
                  <IconButton icon="content-paste" size={20} onPress={handlePasteFromClipboard} style={styles.iconButton} />
                )}
              </View>
            </View>

            {/* Thumbnail strip — appears as soon as URL is analyzed */}
            {showPreview && previewData && (
              <View style={[styles.thumbnailStrip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                {previewData.thumbnail ? (
                  <Image source={{ uri: previewData.thumbnail }} style={styles.thumbnailStripImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnailStripImage, { backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialIcons name="image" size={28} color={theme.colors.onSurfaceVariant} />
                  </View>
                )}
                <View style={styles.thumbnailStripInfo}>
                  <Text style={[styles.thumbnailStripTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {previewData.title}
                  </Text>
                  <Text style={[styles.thumbnailStripMeta, { color: theme.colors.onSurfaceVariant }]}>
                    {previewData.author} · {previewData.duration}
                  </Text>
                  {previewData.views !== 'Unknown' && (
                    <Text style={[styles.thumbnailStripMeta, { color: theme.colors.onSurfaceVariant }]}>
                      {previewData.views} views
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Platform Selection */}
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>Platform</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled style={styles.platformScroller}>
              {[
                { key: 'auto-detect', label: 'Auto-detect', icon: <MaterialIcons name="auto-awesome" size={18} /> },
                { key: 'youtube', label: 'YouTube' },
                { key: 'instagram', label: 'Instagram' },
                { key: 'twitter', label: 'Twitter' },
                // { key: 'tiktok', label: 'TikTok' },   // coming soon
                // { key: 'facebook', label: 'Facebook' }, // coming soon
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.platformOption, { backgroundColor: theme.colors.surfaceVariant }, platform === p.key && styles.selectedPlatform]}
                  onPress={() => handleSelectPlatform(p.key)}
                >
                  {p.icon || getPlatformIcon(p.key, 18, platform === p.key ? 'white' : undefined)}
                  <Text style={[styles.platformText, { color: theme.colors.onSurface }, platform === p.key && styles.selectedPlatformText]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Download Type Selection */}
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>Download Type</Text>
            <View style={[styles.downloadTypeSelector, { borderColor: theme.colors.outline }]}>
              {[
                { key: 'video', label: 'Video', icon: 'video' },
                { key: 'audio', label: 'Audio', icon: 'music' },
                { key: 'image', label: 'Photo', icon: 'image' },
              ].map((t, i) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.downloadTypeOption,
                    { flex: 1, backgroundColor: theme.colors.surfaceVariant },
                    i === 0 && { borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                    i === 2 && { borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                    downloadType === t.key && styles.selectedDownloadType,
                  ]}
                  onPress={() => setDownloadType(t.key)}
                >
                  <FontAwesome5 name={t.icon} size={16} color={downloadType === t.key ? 'white' : theme.colors.onSurface} />
                  <Text style={[styles.downloadTypeText, { color: theme.colors.onSurface }, downloadType === t.key && styles.selectedDownloadTypeText]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quality Selection — horizontal scroll, shows size under each label */}
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>Quality</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              style={[styles.qualityScroller, { borderWidth: 1.5, borderRadius: 50, borderColor: 'rgba(127,0,255,0.3)', overflow: 'hidden' }]}
              contentContainerStyle={styles.qualityScrollContent}
            >
              {[{ label: 'best', filesize: null }, ...availableQualities].map((q, i, arr) => (
                <TouchableOpacity
                  key={q.label}
                  style={[
                    styles.qualityOption,
                    { backgroundColor: theme.colors.surfaceVariant },
                    i === 0 && { borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                    i === arr.length - 1 && { borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                    quality === q.label && styles.selectedQuality,
                  ]}
                  onPress={() => setQuality(q.label)}
                >
                  {qualityPreference === q.label && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>D</Text>
                    </View>
                  )}
                  <Text style={[styles.qualityText, { color: theme.colors.onSurface }, quality === q.label && styles.selectedQualityText]}>
                    {q.label === 'best' ? 'Best' : q.label}
                  </Text>
                  <Text style={[styles.qualitySizeText, quality === q.label && { color: 'rgba(255,255,255,0.75)' }]}>
                    {q.filesize ? formatFileSize(q.filesize) : q.label === 'best' ? 'auto' : '–'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Progress */}
            {loading && (
              <View style={[styles.progressContainer, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                <ProgressBar progress={progress / 100} color="#7F00FF" style={styles.progressBar} />
                <Text style={[styles.progressStatus, { color: theme.colors.onSurfaceVariant }]}>
                  {progress < 100 ? 'Processing...' : 'Complete!'}
                </Text>
              </View>
            )}

            {/* Preview — commented out: thumbnail strip above quality bar covers this
            {showPreview && previewData && (
              <View style={[styles.previewContainer, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={styles.previewTitle}>Content Preview</Text>
                <View style={styles.previewContent}>
                  {previewData.thumbnail ? (
                    <Image source={{ uri: previewData.thumbnail }} style={styles.previewThumbnail} resizeMode="cover" />
                  ) : null}
                  <View style={styles.previewDetails}>
                    <Text style={[styles.previewVideoTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>{previewData.title}</Text>
                    <Text style={[styles.previewAuthor, { color: theme.colors.onSurfaceVariant }]}>By {previewData.author}</Text>
                    <Text style={[styles.previewStats, { color: theme.colors.onSurfaceVariant }]}>{previewData.duration} - {previewData.views} views</Text>
                    <View style={styles.previewQualityContainer}>
                      <Text style={[styles.previewQualityLabel, { color: theme.colors.onSurfaceVariant }]}>Available Qualities:</Text>
                      <View style={styles.previewQualityChips}>
                        {previewData.availableQualities.slice(0, 6).map((q: QualityOption, i: number) => (
                          <Chip
                            key={i}
                            style={[styles.previewQualityChip, quality === q.label && { backgroundColor: '#7F00FF' }]}
                            textStyle={{ fontSize: 10, color: quality === q.label ? 'white' : undefined }}
                            onPress={() => setQuality(q.label)}
                          >
                            {q.label}{q.filesize ? ` · ${formatFileSize(q.filesize)}` : ''}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
            */}

            {/* Error */}
            {showError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color="#e74c3c" />
                <Text style={styles.errorText}>
                  {errorMessage || 'Permission error: Media Library access required.'}
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleDownload}
                style={styles.downloadButton}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
                disabled={!url.trim() || loading}
                loading={loading && !showPreview}
                icon={({ color }) => <MaterialIcons name="file-download" size={24} color={color} />}
              >
                DOWNLOAD
              </Button>
              <Button
                mode="outlined"
                onPress={handleAnalyze}
                style={styles.analyzeButton}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                disabled={!url.trim() || loading}
                loading={loading && showPreview}
                icon={({ color }) => <MaterialIcons name="analytics" size={22} color={color} />}
              >
                ANALYZE
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Downloads - from Redux */}
      {downloads.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="history" size={24} color="#7F00FF" />
            <Text style={[styles.sectionHeaderText, { color: theme.colors.onSurface }]}>Recent Downloads</Text>
          </View>
          <View style={styles.historyList}>
            {downloads.slice(0, 5).map(renderDownloadItem)}
          </View>
        </View>
      )}

      {/* Supported Platforms */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeaderContainer}>
          <MaterialIcons name="stars" size={24} color="#7F00FF" />
          <Text style={styles.sectionHeaderText}>Supported Platforms</Text>
        </View>
        <View style={styles.featuresGrid}>
          {['youtube', 'instagram', 'twitter' /* 'tiktok', 'facebook' — coming soon */].map((p) => (
            <View key={p} style={styles.featureItem}>
              {getPlatformIcon(p, 32)}
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* TODO: Ad display - backlog */}
      {/* <AdBanner placement="home_bottom" /> */}

      <View style={[styles.footerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>Social Media Downloader v1.0.0</Text>
      </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  titleAndAuthContainer: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerTitleContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 12, textAlign: 'center' },
  authButtonsContainer: { marginLeft: 10 },
  authButtons: { flexDirection: 'row' },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8,
  },
  loginButtonText: { color: '#7F00FF', fontWeight: 'bold', fontSize: 14 },
  signupButton: {
    backgroundColor: 'transparent', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: 'white',
  },
  signupButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', maxWidth: '90%' },
  cardContainer: { marginHorizontal: 16, marginTop: -30, marginBottom: 20 },
  card: {
    borderRadius: 16, overflow: 'hidden', elevation: 8,
    shadowColor: '#7000EA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
    borderWidth: 1,
  },
  urlInputContainer: { width: '100%', marginBottom: 20 },
  urlInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  urlInput: { flex: 1, height: 56, paddingHorizontal: 16, fontSize: 16 },
  iconButton: { margin: 0 },
  sectionLabel: {
    fontSize: 15, fontWeight: 'bold', marginBottom: 14, marginTop: 18, letterSpacing: 0.3, textTransform: 'uppercase',
  },
  platformScroller: { marginBottom: 16 },
  platformOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 50, marginRight: 10, marginBottom: 4,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  selectedPlatform: {
    backgroundColor: '#7F00FF', elevation: 4,
    shadowColor: '#7F00FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  platformText: { marginLeft: 8, fontWeight: '500' },
  selectedPlatformText: { color: 'white' },
  downloadTypeSelector: {
    flexDirection: 'row', borderWidth: 1.5, borderRadius: 50, overflow: 'hidden', marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  downloadTypeOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 10,
  },
  selectedDownloadType: {
    backgroundColor: '#7F00FF', elevation: 4,
    shadowColor: '#7F00FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  downloadTypeText: { marginLeft: 6, fontSize: 14, fontWeight: '500' },
  selectedDownloadTypeText: { color: 'white' },
  thumbnailStrip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 16,
  },
  thumbnailStripImage: { width: 90, height: 60, borderRadius: 8 },
  thumbnailStripInfo: { flex: 1, marginLeft: 10 },
  thumbnailStripTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  thumbnailStripMeta: { fontSize: 11 },
  qualityScroller: { marginBottom: 20, marginTop: 4 },
  qualityScrollContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  qualityOption: {
    position: 'relative', overflow: 'visible',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 14, minWidth: 72,
    paddingTop: 10,
  },
  qualitySizeText: { fontSize: 10, color: '#9E9E9E', marginTop: 3, fontWeight: '600', letterSpacing: 0.2 },
  defaultBadge: {
    position: 'absolute', top: 3, right: 4, zIndex: 1,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#7F00FF',
    justifyContent: 'center', alignItems: 'center',
  },
  defaultBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  selectedQuality: {
    backgroundColor: '#7F00FF', elevation: 4,
    shadowColor: '#7F00FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  qualityText: { fontSize: 14, fontWeight: '500' },
  selectedQualityText: { color: 'white', fontWeight: 'bold' },
  progressContainer: {
    marginVertical: 20, alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 1,
  },
  progressText: { fontSize: 32, fontWeight: 'bold', color: '#7F00FF', marginBottom: 10 },
  progressBar: { width: '100%', height: 10, borderRadius: 5 },
  progressStatus: { fontSize: 16, marginTop: 10, fontWeight: '500' },
  previewContainer: {
    marginVertical: 16, borderWidth: 1, borderRadius: 12, padding: 16,
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#7F00FF' },
  previewContent: { flexDirection: 'row' },
  previewThumbnail: { width: 120, height: 80, borderRadius: 8 },
  previewDetails: { flex: 1, marginLeft: 12 },
  previewVideoTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  previewAuthor: { fontSize: 13, marginBottom: 4 },
  previewStats: { fontSize: 12, marginBottom: 6 },
  previewQualityContainer: { marginTop: 4 },
  previewQualityLabel: { fontSize: 12, marginBottom: 4 },
  previewQualityChips: { flexDirection: 'row', flexWrap: 'wrap' },
  previewQualityChip: { marginRight: 4, marginBottom: 4 },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 15, borderRadius: 8, marginVertical: 15,
    borderWidth: 1, borderColor: '#ffcdd2',
  },
  errorText: { color: '#d32f2f', fontSize: 14, marginLeft: 8, flex: 1, lineHeight: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  downloadButton: {
    flex: 1, marginRight: 12, backgroundColor: '#7F00FF', borderRadius: 8, elevation: 4,
    shadowColor: '#7F00FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  analyzeButton: { flex: 1, borderColor: '#7F00FF', borderWidth: 2, borderRadius: 8 },
  historySection: { marginHorizontal: 16, marginBottom: 20 },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionHeaderText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  historyList: { marginTop: 8 },
  historyCard: {
    marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, borderRadius: 12,
  },
  historyCardContent: { flexDirection: 'row', marginTop: 8 },
  historyThumbnail: { width: 80, height: 60, borderRadius: 6 },
  historyDetails: { flex: 1, marginLeft: 12 },
  historyDetailText: { fontSize: 13, marginBottom: 3 },
  historyDetailLabel: { fontWeight: 'bold' },
  historyChip: { marginRight: 6, height: 26 },
  featuresSection: { marginHorizontal: 16, marginBottom: 30 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  featureItem: { width: '18%', alignItems: 'center', marginBottom: 16 },
  featureText: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  footerContainer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 12, marginBottom: 4 },
});
