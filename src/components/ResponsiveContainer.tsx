import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export default function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  return (
    <View style={[styles.container, isWide && styles.constrained]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  constrained: {
    maxWidth: 500,
    alignSelf: 'center',
  },
});
