import React from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TelaCadastro() {
  return (
    <LinearGradient colors={["#632713", "#C94F27"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
          <MaterialIcons name="help-outline" size={20} color="#FDE3CF" />
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/leaozinho.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <MaterialIcons name="person" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nome"
                  placeholderTextColor="#8e6f53"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="E-mail"
                  placeholderTextColor="#8e6f53"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="lock" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="Senha"
                  placeholderTextColor="#8e6f53"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.button} activeOpacity={0.85}>
                <Text style={styles.buttonText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerText}>
            Ao continuar, você concorda com os Termos de Uso e está ciente da Declaração de Privacidade
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  logo: {
    width: 200,
    height: 200,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -70,
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 14,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#3c2a1e',
    paddingLeft: 8,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EC6426',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  smallText: {
    color: '#ffe6ce',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  linkText: {
    color: '#ffe6ce',
    textDecorationLine: 'underline',
  },
  helpButton: {
    position: 'absolute',
    top: 18,
    right: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#FDE3CF',
    width: '105%',
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 1,
  },
  footerText: {
    color: '#ffe6ce',
    fontSize: 12,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 22,
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
