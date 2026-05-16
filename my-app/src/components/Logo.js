import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Polygon } from 'react-native-svg';

export default function Logo({ size = 120 }) {
  const scale = size / 120;
  return (
    <View style={styles.container}>
      <Svg width={size} height={size * 0.9} viewBox="0 0 120 108">
        {/* Shield body */}
        <Path
          d="M60 4 L108 24 L108 60 C108 84 86 100 60 108 C34 100 12 84 12 60 L12 24 Z"
          fill="#1E3A5F"
        />
        {/* Building base */}
        <Rect x="42" y="58" width="36" height="28" rx="2" fill="#2DD4BF" />
        {/* Building roof */}
        <Polygon points="38,58 60,36 82,58" fill="#2DD4BF" />
        {/* Door */}
        <Rect x="54" y="70" width="12" height="16" rx="2" fill="#1E3A5F" />
        {/* Windows */}
        <Rect x="44" y="62" width="8" height="7" rx="1" fill="#1E3A5F" />
        <Rect x="68" y="62" width="8" height="7" rx="1" fill="#1E3A5F" />
      </Svg>
      <Text style={[styles.brand, { fontSize: size * 0.175 }]}>CampusCare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  brand: {
    color: '#1E3A5F',
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
