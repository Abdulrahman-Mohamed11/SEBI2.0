import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryChip({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? <Text style={styles.icon}>{icon} </Text> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  icon: { fontSize: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
