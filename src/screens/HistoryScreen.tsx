import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Divider, IconButton, Searchbar, Menu } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeDownloadFromHistory, clearHistory } from '../store/slices/historySlice';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { DownloadHistoryItem } from '../store/slices/historySlice';

const HistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { downloads } = useSelector((state: RootState) => state.history);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Filter downloads based on search query
  const filteredDownloads = searchQuery
    ? downloads.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : downloads;
  
  // Handle download item deletion
  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to remove this item from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => dispatch(removeDownloadFromHistory(id)),
          style: 'destructive'
        },
      ]
    );
  };
  
  // Handle redownload of an item
  const handleRedownload = (item: DownloadHistoryItem) => {
    navigation.navigate('Download', {
      url: item.url,
      platform: item.platform,
    });
  };
  
  // Render each download history item
  const renderHistoryItem = ({ item }: { item: DownloadHistoryItem }) => {
    const date = new Date(item.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const getPlatformIcon = () => {
      switch (item.platform.toLowerCase()) {
        case 'youtube':
          return <FontAwesome5 name="youtube" size={22} color="red" />;
        case 'instagram':
          return <FontAwesome5 name="instagram" size={22} color="#C13584" />;
        case 'twitter':
        case 'x':
          return <FontAwesome5 name="twitter" size={22} color="#1DA1F2" />;
        case 'tiktok':
          return <FontAwesome5 name="tiktok" size={22} color="#000000" />;
        case 'facebook':
          return <FontAwesome5 name="facebook" size={22} color="#4267B2" />;
        default:
          return <FontAwesome5 name="link" size={22} color="#777777" />;
      }
    };
    
    const getTypeIcon = () => {
      switch (item.type) {
        case 'video':
          return <Ionicons name="videocam" size={16} color="#3498db" />;
        case 'audio':
          return <Ionicons name="musical-notes" size={16} color="#9b59b6" />;
        case 'image':
          return <Ionicons name="image" size={16} color="#2ecc71" />;
        default:
          return <Ionicons name="document" size={16} color="#95a5a6" />;
      }
    };
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <TouchableOpacity 
            style={styles.thumbnailContainer}
            onPress={() => handleRedownload(item)}
          >
            <Image 
              source={{ uri: item.thumbnail || 'https://via.placeholder.com/120x90' }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.typeIconContainer}>
              {getTypeIcon()}
            </View>
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.platformContainer}>
                {getPlatformIcon()}
                <Text style={styles.platformText}>{item.platform}</Text>
              </View>
              
              <View style={styles.qualityContainer}>
                <Text style={styles.qualityText}>{item.quality}</Text>
              </View>
            </View>
            
            <View style={styles.metaContainer}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              
              {item.fileSize && (
                <Text style={styles.sizeText}>{item.fileSize}</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <IconButton
            icon="download"
            size={20}
            onPress={() => handleRedownload(item)}
            tooltip="Download again"
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteItem(item.id)}
            tooltip="Delete from history"
          />
        </View>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Downloads Yet</Text>
      <Text style={styles.emptyText}>
        Your download history will appear here.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Main')}
        style={styles.startButton}
        icon="download"
      >
        Start Downloading
      </Button>
    </View>
  );
  
  // Handle clear all history
  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your entire download history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => dispatch(clearHistory()),
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search downloads..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        {downloads.length > 0 && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item 
              onPress={handleClearHistory} 
              title="Clear All History" 
              leadingIcon="delete-sweep"
            />
          </Menu>
        )}
      </View>
      
      <FlatList
        data={filteredDownloads}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={downloads.length === 0 ? styles.emptyList : styles.list}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    elevation: 0,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  itemContent: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnail: {
    width: 120,
    height: 75,
    backgroundColor: '#e0e0e0',
  },
  typeIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  platformText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  qualityContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 12,
    color: '#3498db',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  sizeText: {
    fontSize: 12,
    color: '#888',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginBottom: 30,
  },
  startButton: {
    paddingHorizontal: 16,
  },
});

export default HistoryScreen;