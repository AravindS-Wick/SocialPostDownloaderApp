import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, Divider, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { removeFromHistory, clearHistory } from '../store/slices/historySlice';
import { DownloadHistoryItem } from '../types';

const HistoryScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { downloads } = useSelector((state: RootState) => state.history);

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromHistory(id));
  };

  const handleClearHistory = () => {
    dispatch(clearHistory());
  };

  const renderHistoryItem = ({ item }: { item: DownloadHistoryItem }) => {
    const date = new Date(item.timestamp);
    const formattedDate = format(date, 'MMM dd, yyyy HH:mm');

    const getPlatformIcon = (platform: string) => {
      switch (platform.toLowerCase()) {
        case 'instagram':
          return 'logo-instagram';
        case 'youtube':
          return 'logo-youtube';
        case 'twitter':
          return 'logo-twitter';
        default:
          return 'cloud-download-outline';
      }
    };

    return (
      <Card style={[styles.historyItem, { backgroundColor: theme.colors.surface }]} mode="outlined">
        <Card.Content style={styles.cardContent}>
          <View style={styles.platformIconContainer}>
            <Ionicons 
              name={getPlatformIcon(item.platform)} 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.filename, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>
              {item.platform} • {item.type} • {item.resolution}
            </Text>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {formattedDate}
            </Text>
          </View>
          
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={() => handleRemoveItem(item.id)}
            mode="outlined"
            style={styles.deleteButton}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Download History
        </Text>
        {downloads.length > 0 && (
          <Button 
            onPress={handleClearHistory} 
            mode="text" 
            textColor={theme.colors.error}
          >
            Clear All
          </Button>
        )}
      </View>
      
      {downloads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="time-outline" 
            size={80} 
            color={theme.colors.onSurfaceVariant} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No downloads yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            Your download history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={downloads}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIconContainer: {
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    margin: 0,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HistoryScreen;