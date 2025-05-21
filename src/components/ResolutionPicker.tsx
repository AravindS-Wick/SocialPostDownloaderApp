import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

interface ResolutionPickerProps {
  availableResolutions: string[];
  selectedResolution: string;
  onSelect: (resolution: string) => void;
}

const ResolutionPicker: React.FC<ResolutionPickerProps> = ({
  availableResolutions,
  selectedResolution,
  onSelect,
}) => {
  const theme = useTheme();

  // Map resolution to a more descriptive label
  const getResolutionLabel = (resolution: string): string => {
    switch (resolution) {
      case '1080p':
        return 'Full HD (1080p)';
      case '720p':
        return 'HD (720p)';
      case '480p':
        return 'SD (480p)';
      case '360p':
        return 'Low (360p)';
      default:
        return resolution;
    }
  };

  // Sort resolutions by quality (descending)
  const sortedResolutions = [...availableResolutions].sort((a, b) => {
    const aValue = parseInt(a.replace('p', ''));
    const bValue = parseInt(b.replace('p', ''));
    return bValue - aValue;
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Select Video Quality
      </Text>
      
      <View style={styles.optionsContainer}>
        {sortedResolutions.map((resolution) => (
          <TouchableOpacity
            key={resolution}
            style={[
              styles.optionButton,
              selectedResolution === resolution && { borderColor: theme.colors.primary },
            ]}
            onPress={() => onSelect(resolution)}
          >
            <Text
              style={[
                styles.optionText,
                { color: selectedResolution === resolution ? theme.colors.primary : theme.colors.text },
              ]}
            >
              {getResolutionLabel(resolution)}
            </Text>
            
            {selectedResolution === resolution && (
              <Feather name="check" size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 110,
  },
  optionText: {
    marginRight: 4,
  },
});

export default ResolutionPicker;
