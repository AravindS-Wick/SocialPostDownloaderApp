import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, RadioButton, useTheme } from 'react-native-paper';

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
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Video Resolution</Text>
      <RadioButton.Group
        onValueChange={(value) => onSelect(value)}
        value={selectedResolution}
      >
        <View style={styles.optionsContainer}>
          {availableResolutions.map((resolution) => (
            <View key={resolution} style={styles.option}>
              <RadioButton.Item
                label={resolution}
                value={resolution}
                disabled={disabled}
                style={styles.radioItem}
                labelStyle={[styles.radioLabel, { color: theme.colors.onSurface }]}
                position="leading"
              />
            </View>
          ))}
        </View>
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
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
  option: {
    width: '50%',
  },
  radioItem: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  radioLabel: {
    fontSize: 14,
  },
});

export default ResolutionPicker;