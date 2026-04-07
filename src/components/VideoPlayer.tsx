import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Button } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

interface VideoPlayerProps {
  source: string;
  title: string;
  posterImage?: string;
  filePath?: string;
}

export default function VideoPlayer({ source, title, posterImage, filePath }: VideoPlayerProps) {
  const theme = useTheme();
  const [showExternal, setShowExternal] = useState(false);

  const handleOpenExternal = async () => {
    try {
      // Try to open file path if available, otherwise use URL
      const uri = filePath || source;

      if (!uri) {
        Alert.alert('Error', 'No file or URL available to open');
        return;
      }

      // Use file:// protocol for local files
      const openUri = filePath ? `file://${filePath}` : uri;

      await Linking.openURL(openUri);
      setShowExternal(false);
    } catch (err) {
      console.error('Failed to open media:', err);
      Alert.alert('Error', 'Could not open media with external player. Make sure you have a media player installed.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Thumbnail/Poster */}
      {posterImage && (
        <View style={styles.posterContainer}>
          <Text style={styles.posterText}>{title}</Text>
        </View>
      )}

      {/* Play Button Overlay */}
      <TouchableOpacity
        style={styles.playButtonOverlay}
        onPress={() => setShowExternal(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play-circle"
          size={80}
          color="white"
          style={{ opacity: 0.8 }}
        />
      </TouchableOpacity>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
        <Ionicons name="information-circle" size={20} color="#3498db" />
        <Text style={styles.infoText}>
          Click play to open in default media player
        </Text>
      </View>

      {/* Open Button */}
      {showExternal && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleOpenExternal}
            icon="open-in-new"
            style={styles.openButton}
          >
            Open Video in Player
          </Button>
          <Button
            mode="text"
            onPress={() => setShowExternal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1a1a1a',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  posterText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playButtonOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoBox: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 5,
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 20,
    gap: 8,
  },
  openButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
});
