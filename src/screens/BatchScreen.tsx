import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TextInput,
  Clipboard, // eslint-disable-line deprecation/deprecation
} from 'react-native';
import { Text, Button, IconButton, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { addDownloadToHistory } from '../store/slices/historySlice';
import { setBatchItemStatus, resetBatchState } from '../store/slices/downloadSlice';
import type { BatchItem } from '../store/slices/downloadSlice';
import MoreFromCreator from '../components/MoreFromCreator';
import ResponsiveContainer from '../components/ResponsiveContainer';

const BatchScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { qualityPreference } = useSelector((state: RootState) => state.settings);

  const [inputUrl, setInputUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  const detectPlatform = (url: string): string => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
    return 'unknown';
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setInputUrl(text);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const handleFetchPosts = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    // Reset previous batch state before fetching new
    dispatch(resetBatchState());
    setSubmittedUrl(trimmed);
  };

  const handleClear = () => {
    setInputUrl('');
    setSubmittedUrl('');
    dispatch(resetBatchState());
  };

  const handleBatchDownload = async (selectedItems: BatchItem[]) => {
    if (isBatchDownloading) return;
    setIsBatchDownloading(true);

    const quality = qualityPreference !== 'manual' ? qualityPreference : 'best';
    let completedCount = 0;
    let failedCount = 0;

    for (const item of selectedItems) {
      dispatch(setBatchItemStatus({ id: item.id, status: 'downloading' }));
      try {
        const DownloadService = (await import('../services/DownloadService')).default;
        const result = await DownloadService.downloadContent({
          url: item.url,
          type: 'video',
          quality,
          platform: item.platform,
          useAutoFormat: true,
          saveLocation: 'media_library' as const,
        });

        const success = result.success;
        dispatch(setBatchItemStatus({ id: item.id, status: success ? 'completed' : 'failed' }));

        if (success && result.metadata) {
          completedCount++;
          dispatch(addDownloadToHistory({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            url: item.url,
            title: result.metadata.title,
            thumbnail: result.metadata.thumbnail,
            platform: item.platform,
            type: 'video',
            quality,
            createdAt: new Date().toISOString(),
            fileSize: result.metadata.fileSize,
            filePath: result.filePath,
          }));
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
        dispatch(setBatchItemStatus({ id: item.id, status: 'failed' }));
      }
    }

    setIsBatchDownloading(false);

    if (Platform.OS !== 'web') {
      const msg = failedCount > 0
        ? `${completedCount} downloaded, ${failedCount} failed.`
        : `Successfully downloaded ${completedCount} item(s).`;
      Alert.alert('Batch Download Complete', msg);
    }
  };

  const platform = submittedUrl ? detectPlatform(submittedUrl) : '';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ResponsiveContainer>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="layers" size={28} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Batch Download
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter a video URL to discover more content from the same creator and download multiple posts at once.
        </Text>

        {/* URL Input */}
        <View style={styles.inputSection}>
          <View style={[styles.urlInputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
            <TextInput
              style={[styles.urlInput, { color: theme.colors.onSurface }]}
              placeholder="Paste a video or channel URL"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {inputUrl ? (
              <IconButton icon="close" size={20} onPress={handleClear} />
            ) : (
              <IconButton icon="content-paste" size={20} onPress={handlePaste} />
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleFetchPosts}
            disabled={!inputUrl.trim() || isBatchDownloading}
            style={styles.fetchButton}
            icon="magnify"
          >
            Find Creator Posts
          </Button>
        </View>

        {/* Platform indicator */}
        {submittedUrl && platform !== 'unknown' && (
          <View style={[styles.platformIndicator, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialIcons name="info-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.platformText, { color: theme.colors.onSurfaceVariant }]}>
              Platform detected: {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
          </View>
        )}

        {/* Creator Posts Grid */}
        {submittedUrl ? (
          <MoreFromCreator url={submittedUrl} onDownloadSelected={handleBatchDownload} showEmptyState />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={80} color={theme.colors.surfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No URL Entered
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Paste a video URL from YouTube, Instagram, Twitter, TikTok, or Facebook to see more posts from the same creator.
            </Text>
          </View>
        )}

        {/* Downloading indicator */}
        {isBatchDownloading && (
          <View style={[styles.downloadingBanner, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="download" size={18} color={theme.colors.onPrimaryContainer} />
            <Text style={[styles.downloadingText, { color: theme.colors.onPrimaryContainer }]}>
              Batch download in progress... Please don't leave this screen.
            </Text>
          </View>
        )}
      </ResponsiveContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 12,
  },
  urlInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  fetchButton: {
    borderRadius: 8,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  platformText: {
    fontSize: 13,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  downloadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
  },
  downloadingText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
});

export default BatchScreen;
