import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

type ThemeToggleProps = {
  value: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ value, onToggle }: ThemeToggleProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Switch
        value={value}
        onValueChange={onToggle}
        color={theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
