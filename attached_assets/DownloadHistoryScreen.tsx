import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, Button, Divider, IconButton, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockAPI } from '../services/api';

interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  platform: string;
  type: 'video' | 'audio';
  quality: string;
  createdAt: string;
  fileSize?: string;
}

const DownloadHistoryScreen = () => {
  const theme = useTheme();
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      // In a real app, this would call an actual API
      const response = await mockAPI.getDownloadHistory();
      setHistory(response.data.history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      Alert.alert('Error', 'Failed to load download history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    // In a real app, this would trigger a new download
    Alert.alert('Re-download', `Would re-download ${item.title}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the item
            setHistory(history.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return '#FF0000';
      case 'instagram': return '#E1306C';
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#4267B2';
      case 'tiktok': return '#000000';
      default: return theme.colors.primary;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="history"
        size={80}
        color={theme.colors.onSurfaceVariant}
        style={{ opacity: 0.6 }}
      />
      <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        No download history yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
        Your downloaded content will appear here
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: DownloadHistoryItem }) => (
    <Surface style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text 
            style={[styles.title, { color: theme.colors.onSurface }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          />
        </View>
        
        <View style={styles.metadataRow}>
          <Chip 
            style={[styles.platformChip, { backgroundColor: getPlatformColor(item.platform) + '20' }]}
            textStyle={{ color: getPlatformColor(item.platform), fontSize: 12 }}
            compact
          >
            {item.platform}
          </Chip>
          
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
            {item.type} • {item.quality}
            {item.fileSize && ` • ${item.fileSize}`}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.redownloadButton, 
            { backgroundColor: theme.colors.primary + '15' }
          ]}
          onPress={() => handleRedownload(item)}
        >
          <MaterialCommunityIcons
            name="download"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.redownloadText, { color: theme.colors.primary }]}>
            Re-download
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading download history...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      
      {history.length > 0 && (
        <Surface style={[styles.clearButtonContainer, { backgroundColor: theme.colors.surface }]}>
          <Button 
            mode="outlined" 
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to clear your entire download history?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => setHistory([]),
                  },
                ]
              );
            }}
            icon="delete-sweep-outline"
            textColor={theme.colors.error}
            style={styles.clearButton}
          >
            Clear History
          </Button>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
    marginTop: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    margin: -8,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  platformChip: {
    marginRight: 8,
    height: 24,
  },
  dateText: {
    fontSize: 12,
  },
  detailsRow: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
  },
  redownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  redownloadText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
  },
  clearButtonContainer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  clearButton: {
    width: '100%',
    borderColor: 'rgba(208, 2, 27, 0.2)',
  },
});

export default DownloadHistoryScreen;