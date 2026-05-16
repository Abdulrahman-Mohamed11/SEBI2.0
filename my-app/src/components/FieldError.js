import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function FieldError({ message }) {
  if (!message) return null;
  return <Text style={styles.error}>⚠ {message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
  },
});
