import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const CONFIG = {
  PENDING:     { label: 'Pending',     bg: COLORS.pendingBg,    text: COLORS.pendingText },
  IN_PROGRESS: { label: 'In Progress', bg: COLORS.inProgressBg, text: COLORS.inProgressText },
  RESOLVED:    { label: 'Resolved',    bg: COLORS.resolvedBg,   text: COLORS.resolvedText },
  CLOSED:      { label: 'Closed',      bg: COLORS.closedBg,     text: COLORS.closedText },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.PENDING;
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
