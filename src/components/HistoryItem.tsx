import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

interface HistoryItemProps {
  item: {
    id: string;
    url: string;
    title: string;
    platform: string;
    type: string;
    quality?: string;
    createdAt: string;
    thumbnail?: string;
  };
  onPress: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onPress }) => {
  const theme = useTheme();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'youtube';
      case 'instagram':
        return 'instagram';
      case 'twitter':
        return 'twitter';
      default:
        return 'download';
    }
  };
  
  // Get file type icon
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return 'video';
      case 'audio':
        return 'music';
      case 'image':
        return 'image';
      default:
        return 'file';
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <View style={styles.iconContainer}>
          <View style={[styles.platformIcon, { backgroundColor: getIconColor(item.platform) }]}>
            <Feather name={getPlatformIcon(item.platform) as any} size={20} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <Feather name={getTypeIcon(item.type) as any} size={14} color={theme.colors.text} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.text }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            
            {item.quality && (
              <>
                <Text style={[styles.metaSeparator, { color: theme.colors.text }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.colors.text }]}>
                  {item.quality}
                </Text>
              </>
            )}
          </View>
          
          <Text style={[styles.date, { color: theme.colors.text }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.actionContainer}>
          <Feather name="download" size={20} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

// Helper function to get platform color
const getIconColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return '#FF0000';
    case 'instagram':
      return '#E1306C';
    case 'twitter':
      return '#1DA1F2';
    default:
      return '#2196F3';
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  touchable: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  metaSeparator: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  actionContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});

export default HistoryItem;
