import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

interface ResolutionPickerProps {
  availableResolutions: string[];
  selectedResolution: string;
  onSelect: (resolution: string) => void;
  disabled?: boolean;
}

const ResolutionPicker: React.FC<ResolutionPickerProps> = ({
  availableResolutions,
  selectedResolution,
  onSelect,
  disabled = false
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {availableResolutions.map((resolution) => (
          <Chip
            key={resolution}
            selected={selectedResolution === resolution}
            onPress={() => onSelect(resolution)}
            style={styles.chip}
            selectedColor={selectedResolution === resolution ? 'white' : undefined}
            mode={selectedResolution === resolution ? 'flat' : 'outlined'}
            disabled={disabled}
          >
            {resolution}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollView: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
    marginVertical: 4,
  },
});

export default ResolutionPicker;