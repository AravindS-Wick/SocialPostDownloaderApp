import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Searchbar, useTheme, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';
import { mockAPI } from '../services/api';
import HistoryItem from '../components/HistoryItem';
import { getActivityLogs, clearActivityLogs } from '../services/logger';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface HistoryScreenProps {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);

  // Load download history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Get history from API mock
      const response = await mockAPI.getDownloadHistory();
      const apiHistory = response.data.history;
      
      // Get local activity logs as backup
      const activityLogs = await getActivityLogs();
      const successfulDownloads = activityLogs
        .filter(log => log.status === 'complete' && log.meta.success)
        .map(log => ({
          id: `local_${log.timestamp}`,
          url: log.meta.url,
          title: `Downloaded from ${log.type}`,
          platform: log.type,
          type: log.meta.downloadType,
          createdAt: log.timestamp,
        }));
      
      // Combine both sources (in a real app we'd deduplicate)
      const combinedHistory = [...apiHistory, ...successfulDownloads];
      
      setHistory(combinedHistory);
      setFilteredHistory(combinedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredHistory(history);
      return;
    }
    
    const filtered = history.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.platform.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  // Clear history with confirmation
  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your download history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Clear local activity logs
              await clearActivityLogs();
              
              // In a real app, we would also call an API to clear server-side history
              
              // Reset state
              setHistory([]);
              setFilteredHistory([]);
              setSearchQuery('');
              
              Alert.alert('Success', 'Download history cleared successfully.');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear download history. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle item press - redownload
  const handleItemPress = (item: any) => {
    navigation.navigate('Download', { url: item.url, platform: item.platform });
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={64} color={theme.colors.primary} />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        No downloads yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
        Downloaded content will appear here
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Main')}
        style={styles.emptyButton}
      >
        Start Downloading
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <Searchbar
        placeholder="Search downloads"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>
            Loading download history...
          </Text>
        </View>
      ) : (
        <>
          {history.length > 0 && (
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { color: theme.colors.text }]}>
                {filteredHistory.length} {filteredHistory.length === 1 ? 'download' : 'downloads'}
              </Text>
              <IconButton
                icon="trash-2"
                size={20}
                onPress={confirmClearHistory}
              />
            </View>
          )}
          
          <FlatList
            data={filteredHistory}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <HistoryItem item={item} onPress={() => handleItemPress(item)} />
            )}
            contentContainerStyle={history.length === 0 ? { flex: 1 } : styles.listContent}
            ListEmptyComponent={renderEmptyState}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 16,
  },
});

export default HistoryScreen;
