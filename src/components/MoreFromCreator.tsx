import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { downloadAPI } from '../services/api';
import {
  setBatchItems,
  appendBatchItems,
  toggleBatchItemSelection,
  selectAllBatchItems,
  deselectAllBatchItems,
  resetBatchState,
} from '../store/slices/downloadSlice';
import type { BatchItem } from '../store/slices/downloadSlice';

interface MoreFromCreatorProps {
  url: string;
  onDownloadSelected: (items: BatchItem[]) => void;
  showEmptyState?: boolean;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MoreFromCreator: React.FC<MoreFromCreatorProps> = ({ url, onDownloadSelected, showEmptyState = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { batchItems } = useSelector((state: RootState) => state.download);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const mapPostsToBatchItems = (posts: any[]): BatchItem[] =>
    posts.map((post: any) => ({
      id: post.id,
      url: post.url,
      title: post.title,
      thumbnail: post.thumbnail,
      duration: post.duration,
      platform: post.platform,
      selected: false,
      status: 'pending' as const,
      progress: 0,
    }));

  // Fetch first page when URL changes
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      setComingSoon(false);
      setCurrentPage(1);
      setHasMore(false);

      try {
        const data = await downloadAPI.getChannelPosts(url, 1);
        if (cancelled) return;

        if (data.comingSoon) {
          setComingSoon(true);
          setComingSoonMessage(data.message || 'Coming soon');
          dispatch(resetBatchState());
          return;
        }

        if (data.posts && data.posts.length > 0) {
          dispatch(setBatchItems(mapPostsToBatchItems(data.posts)));
          setHasMore(data.hasMore === true);
        } else {
          dispatch(resetBatchState());
          setHasMore(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load creator posts');
          dispatch(resetBatchState());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();
    return () => { cancelled = true; };
  }, [url, dispatch]);

  // Load more pages
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);

    try {
      const data = await downloadAPI.getChannelPosts(url, nextPage);

      if (data.posts && data.posts.length > 0) {
        dispatch(appendBatchItems(mapPostsToBatchItems(data.posts)));
        setCurrentPage(nextPage);
        setHasMore(data.hasMore === true);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error('Load more error:', err);
      // Don't clear existing items on load-more failure
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, url, dispatch]);

  const selectedCount = batchItems.filter(i => i.selected).length;
  const allSelected = batchItems.length > 0 && selectedCount === batchItems.length;

  const handleDownloadSelected = () => {
    const selected = batchItems.filter(i => i.selected);
    if (selected.length > 0) {
      onDownloadSelected(selected);
    }
  };

  // --- Render states ---

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
        <ActivityIndicator size="small" />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Loading posts from this creator...
        </Text>
      </View>
    );
  }

  if (comingSoon) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          More from this Creator
        </Text>
        <Chip icon="clock-outline" style={styles.comingSoonChip}>{comingSoonMessage}</Chip>
      </View>
    );
  }

  if (error) {
    if (!showEmptyState) return null;
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.error }]}>
            Failed to load posts
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (batchItems.length === 0) {
    if (!showEmptyState) return null;
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.emptyStateContainer}>
          <Ionicons name="videocam-off-outline" size={40} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
            No posts found
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            Could not find other posts from this creator. Try a different URL.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          More from this Creator ({batchItems.length})
        </Text>
        <TouchableOpacity
          onPress={() => dispatch(allSelected ? deselectAllBatchItems() : selectAllBatchItems())}
        >
          <Text style={[styles.selectAllText, { color: theme.colors.primary }]}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={batchItems}
        keyExtractor={(item) => item.id}
        horizontal={false}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.postCard,
              { backgroundColor: theme.colors.surface },
              item.selected && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => dispatch(toggleBatchItemSelection(item.id))}
            activeOpacity={0.7}
          >
            <View style={styles.thumbnailContainer}>
              {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceDisabled }]} />
              )}
              {item.duration != null && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
                </View>
              )}
              <View style={styles.checkboxOverlay}>
                <Checkbox
                  status={item.selected ? 'checked' : 'unchecked'}
                  onPress={() => dispatch(toggleBatchItemSelection(item.id))}
                />
              </View>
              {item.status === 'downloading' && (
                <View style={styles.progressOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              {item.status === 'completed' && (
                <View style={[styles.progressOverlay, { backgroundColor: 'rgba(0,150,0,0.6)' }]}>
                  <Text style={styles.durationText}>Done</Text>
                </View>
              )}
              {item.status === 'failed' && (
                <View style={[styles.progressOverlay, { backgroundColor: 'rgba(200,0,0,0.6)' }]}>
                  <Text style={styles.durationText}>Failed</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.postTitle, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Load More button */}
      {hasMore && (
        <Button
          mode="outlined"
          onPress={handleLoadMore}
          loading={loadingMore}
          disabled={loadingMore}
          style={styles.loadMoreButton}
          icon="chevron-down"
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </Button>
      )}

      {/* Download Selected button */}
      {selectedCount > 0 && (
        <Button
          mode="contained"
          onPress={handleDownloadSelected}
          style={styles.downloadButton}
          icon="download-multiple"
        >
          {`Download Selected (${selectedCount})`}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  comingSoonChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postCard: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  checkboxOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 12,
    padding: 6,
    lineHeight: 16,
  },
  loadMoreButton: {
    marginTop: 12,
  },
  downloadButton: {
    marginTop: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MoreFromCreator;
