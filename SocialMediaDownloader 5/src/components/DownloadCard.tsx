import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import SocialMediaIcon from './SocialMediaIcon';
import { DownloadHistoryItem } from '../types';

type DownloadCardProps = {
  item: DownloadHistoryItem;
  onRedownload: () => void;
  onDelete: () => void;
};

export default function DownloadCard({
  item,
  onRedownload,
  onDelete,
}: DownloadCardProps) {
  const theme = useTheme();
  
  // Get file extension from filename
  const fileExt = item.filename.split('.').pop() || '';
  
  // Format date
  const formattedDate = format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm');
  
  // Get icon based on download type
  const getTypeIcon = () => {
    switch (item.type) {
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
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <SocialMediaIcon platform={item.platform} size={24} color={theme.colors.primary} />
          <Text style={[styles.platform, { color: theme.colors.primary }]}>
            {item.platform}
          </Text>
          <View style={styles.typeContainer}>
            <Feather name={getTypeIcon()} size={16} color={theme.colors.text} />
            <Text style={[styles.type, { color: theme.colors.text }]}>
              {item.type}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.filename, { color: theme.colors.text }]} numberOfLines={1}>
          {item.filename}
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Format: <Text style={styles.highlight}>{fileExt.toUpperCase()}</Text>
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Resolution: <Text style={styles.highlight}>{item.resolution}</Text>
          </Text>
        </View>
        
        <Text style={[styles.date, { color: theme.colors.text }]}>
          {formattedDate}
        </Text>
        
        <View style={styles.urlContainer}>
          <Text style={[styles.urlLabel, { color: theme.colors.text }]}>URL:</Text>
          <Text style={[styles.url, { color: theme.colors.text }]} numberOfLines={1}>
            {item.url}
          </Text>
        </View>
      </Card.Content>
      
      <Card.Actions style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onRedownload}>
          <Feather name="refresh-cw" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            Re-download
          </Text>
        </TouchableOpacity>
        
        <IconButton
          icon="trash-can-outline"
          iconColor={theme.colors.error}
          onPress={onDelete}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platform: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  type: {
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  filename: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
  },
  highlight: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  url: {
    flex: 1,
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 8,
  },
});
