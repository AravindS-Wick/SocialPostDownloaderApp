import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

interface DownloadProgressProps {
  progress: number; // 0 to 100
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ progress }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      <View style={styles.progressBarOuter}>
        <View 
          style={[
            styles.progressBarInner, 
            { 
              width: `${progress}%`, 
              backgroundColor: theme.colors.primary 
            }
          ]} 
        />
      </View>
      <Text style={styles.statusText}>
        {progress < 100 ? 'Downloading...' : 'Download Complete'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  progressBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 5,
  },
  statusText: {
    marginTop: 8,
    color: '#666',
  },
});

export default DownloadProgress;