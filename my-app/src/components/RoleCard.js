import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleCard({ icon, title, description, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardSelected: {
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#2DD4BF',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCircleSelected: {
    backgroundColor: '#CCFBF1',
  },
  icon: { fontSize: 22 },
  textBlock: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 2,
  },
  titleSelected: { color: '#1E3A5F' },
  description: {
    fontSize: 12,
    color: '#718096',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
