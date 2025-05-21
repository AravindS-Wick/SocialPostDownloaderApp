import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  disabled?: boolean;
}

interface Platform {
  id: string;
  label: string;
  icon: string;
  iconType: 'ionicons' | 'fontawesome';
}

const platforms: Platform[] = [
  { id: 'auto', label: 'Auto-detect', icon: 'magic', iconType: 'fontawesome' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', iconType: 'ionicons' },
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube', iconType: 'ionicons' },
  { id: 'twitter', label: 'Twitter', icon: 'logo-twitter', iconType: 'ionicons' },
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelectPlatform,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Select Platform
      </Text>
      <View style={styles.optionsContainer}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[
              styles.option,
              selectedPlatform === platform.id && [
                styles.selectedOption,
                { backgroundColor: theme.colors.primary + '30' },
              ],
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => onSelectPlatform(platform.id)}
            disabled={disabled}
          >
            {platform.iconType === 'ionicons' ? (
              <Ionicons
                name={platform.icon as any}
                size={22}
                color={theme.colors.primary}
                style={styles.icon}
              />
            ) : (
              <FontAwesome
                name={platform.icon as any}
                size={22}
                color={theme.colors.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.optionText,
                { color: theme.colors.text },
                selectedPlatform === platform.id && { fontWeight: 'bold', color: theme.colors.primary },
              ]}
            >
              {platform.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
  },
});

export default PlatformSelector;