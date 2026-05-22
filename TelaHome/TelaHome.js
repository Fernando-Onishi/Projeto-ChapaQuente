import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function TelaHome({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo à Home</Text>
        <Text style={styles.subtitle}>Você está logado com sucesso.</Text>
      </View>

      <TouchableOpacity style={styles.botaoFavoritos} onPress={() => navigation.navigate('Favoritos')}>
        <Text style={styles.textoBotaoFavoritos}>Favoritos</Text>
      </TouchableOpacity>
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
  content: {
    alignItems: 'center',
  },
  botaoFavoritos: {
    backgroundColor: '#EC6426',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  textoBotaoFavoritos: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
