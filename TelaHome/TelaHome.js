import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function TelaHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home</Text>
      <Text style={styles.subtitle}>Você está logado com sucesso.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#632713',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e6f53',
    textAlign: 'center',
  },
});